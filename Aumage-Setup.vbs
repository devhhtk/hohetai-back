Set objShell = CreateObject("WScript.Shell")
Set objFSO = CreateObject("Scripting.FileSystemObject")

' Get the directory where this script lives
strDir = objFSO.GetParentFolderName(WScript.ScriptFullName)

' Check if Node.js is installed
strCheck = objShell.Exec("node --version").StdOut.ReadLine()
If InStr(strCheck, "v") = 0 Then
    MsgBox "Node.js not found. Please install Node.js from https://nodejs.org and try again.", 16, "Aumage Setup"
    WScript.Quit
End If

' Launch setup server silently
objShell.Run "node """ & strDir & "\setup-server.js""", 0, False

' Wait a moment for server to start
WScript.Sleep 1500

' Open browser (must use cmd /c start — start is a CMD built-in)
objShell.Run "cmd /c start http://localhost:7842", 0, False

MsgBox "Aumage Setup Wizard is running at http://localhost:7842" & Chr(13) & Chr(10) & Chr(13) & Chr(10) & "Use the Deploy tab to deploy your Worker." & Chr(13) & Chr(10) & "Close this dialog when done.", 64, "Aumage Setup"
