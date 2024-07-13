use std::{
    sync::{Arc, Mutex},
    thread,
    time::{Duration, Instant},
};

use neon::prelude::*;
use once_cell::sync::Lazy;

extern "C" {
    fn click(button: i32, down: bool);
}

static ENABLED: Lazy<Arc<Mutex<bool>>> = Lazy::new(|| Arc::new(Mutex::new(false)));
static CHANGED: Lazy<Arc<Mutex<bool>>> = Lazy::new(|| Arc::new(Mutex::new(false)));
static BUTTON: Lazy<Arc<Mutex<i32>>> = Lazy::new(|| Arc::new(Mutex::new(0)));
static INTERVAL: Lazy<Arc<Mutex<Option<u64>>>> = Lazy::new(|| Arc::new(Mutex::new(None)));
static DURATION: Lazy<Arc<Mutex<Option<u64>>>> = Lazy::new(|| Arc::new(Mutex::new(None)));

fn set_button(mut cx: FunctionContext) -> JsResult<JsUndefined> {
    let str = cx.argument::<JsString>(0).unwrap().value(&mut cx);
    *BUTTON.lock().unwrap() = match str.as_str() {
        "left" => 0,
        "right" => 1,
        "middle" => 3,
        _ => panic!("invalid button {}", str),
    };
    Ok(cx.undefined())
}

fn set_interval(mut cx: FunctionContext) -> JsResult<JsBoolean> {
    let num: Result<u64, _> = cx.argument::<JsString>(0).unwrap().value(&mut cx).parse();
    if let Ok(num) = num {
        *INTERVAL.lock().unwrap() = Some(num);
        return Ok(cx.boolean(true));
    } else {
        return Ok(cx.boolean(false));
    }
}

fn set_duration(mut cx: FunctionContext) -> JsResult<JsBoolean> {
    let num: Result<u64, _> = cx.argument::<JsString>(0).unwrap().value(&mut cx).parse();
    if let Ok(num) = num {
        *DURATION.lock().unwrap() = Some(num);
        return Ok(cx.boolean(true));
    } else {
        return Ok(cx.boolean(false));
    }
}

fn toggle(mut cx: FunctionContext) -> JsResult<JsUndefined> {
    let enabled = !*ENABLED.lock().unwrap();
    *ENABLED.lock().unwrap() = enabled;
    if enabled {
        let button = *BUTTON.lock().unwrap();
        let interval = *INTERVAL.lock().unwrap();
        let duration = *DURATION.lock().unwrap();
        if let (Some(interval), Some(duration)) = (interval, duration) {
            thread::spawn(move || loop {
                {
                    let mut changed = CHANGED.lock().unwrap();
                    let mut enabled = ENABLED.lock().unwrap();
                    if *changed {
                        *changed = false;
                        *enabled = false;
                    }
                    if !*enabled {
                        break;
                    }
                }
                let now = Instant::now();
                unsafe { click(button, true) }
                let elapsed = now.elapsed();
                if duration > 0 {
                    let mut dur = Duration::from_millis(duration);
                    if dur > elapsed {
                        dur -= elapsed;
                        thread::sleep(dur)
                    }
                }
                let now = Instant::now();
                unsafe { click(button, false) }
                let elapsed = if duration > 0 {
                    now.elapsed()
                } else {
                    now.elapsed() + elapsed
                };
                if interval > 0 {
                    let mut dur = Duration::from_millis(interval);
                    if dur > elapsed {
                        dur -= elapsed;
                        thread::sleep(dur);
                    }
                }
            });
        }
    }
    Ok(cx.undefined())
}

#[neon::main]
fn main(mut cx: ModuleContext) -> NeonResult<()> {
    cx.export_function("setButton", set_button)?;
    cx.export_function("setInterval", set_interval)?;
    cx.export_function("setDuration", set_duration)?;
    cx.export_function("toggle", toggle)?;
    Ok(())
}
