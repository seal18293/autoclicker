#include <Windows.h>

extern "C"
{
	void click(int button, bool down)
	{
		mouse_event(button == 0	  ? down ? MOUSEEVENTF_LEFTDOWN
										 : MOUSEEVENTF_LEFTUP
					: button == 1 ? down ? MOUSEEVENTF_RIGHTDOWN
										 : MOUSEEVENTF_RIGHTUP
					: down		  ? MOUSEEVENTF_MIDDLEDOWN
								  : MOUSEEVENTF_MIDDLEUP,
					0, 0, 0, 0);
	}
}