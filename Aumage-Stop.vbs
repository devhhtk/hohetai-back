Set objShell = CreateObject("WScript.Shell")
objShell.Run "taskkill /f /im node.exe", 0, True
MsgBox "Aumage Setup Wizard stopped.", 64, "Aumage Setup"
