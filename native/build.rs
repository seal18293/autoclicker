fn main() {
    #[cfg(windows)]
    {
        println!("cargo::rerun-if-changed=src/windows.cpp");
        cc::Build::new()
            .file("src/windows.cpp")
            .compile("native-cpp");
    }
}
