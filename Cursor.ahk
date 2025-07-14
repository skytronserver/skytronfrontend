#Requires AutoHotkey v2.0

; ==============================================
; Time Champ-Friendly Automation Activity Script
; Simulates human activity via mouse + keyboard
; ==============================================

; 🔥 Hotkeys:
; F6 - Start/Stop automation
; F7 - Toggle mouse movement
; F8 - Toggle tab switching
; F9 - Toggle typing simulation
; F10 - Save current mouse position
; F11 - Clear saved positions
; Ctrl + Up/Down - Change interval
; Ctrl + Alt + P - Show settings
; Ctrl + Alt + L - Show activity log
; Ctrl + Esc - Emergency stop

; -------------------------
; 🌍 Global Variables
; -------------------------
global isRunning := false
global moveMouseEnabled := true
global switchTabsEnabled := true
global typeSimulationEnabled := false
global intervalSeconds := 30
global mouseSpeed := 50
global currentX := 0
global currentY := 0
global savedPositions := []
global activityLog := []
global maxLogSize := 100
global lastBatteryWarning := 0
global batteryThreshold := 20

; Common typing phrases for simulation
global typingPhrases := [
    "Hello world",
    "Testing system",
    "Checking status",
    "Processing data",
    "Running diagnostics",
    "System active",
    "Monitoring performance"
]

; -------------------------
; 📝 Logging Functions
; -------------------------
LogActivity(action)
{
    global activityLog, maxLogSize
    timestamp := FormatTime(, "yyyy-MM-dd HH:mm:ss")
    activityLog.Push(timestamp . ": " . action)
    if activityLog.Length > maxLogSize
        activityLog.RemoveAt(1)
}

ShowActivityLog()
{
    global activityLog
    logText := "📋 Activity Log:`n`n"
    for entry in activityLog
        logText .= entry . "`n"
    MsgBox(logText, "Activity Log")
}

; -------------------------
; 🔋 Battery Monitor
; -------------------------
CheckBatteryLevel()
{
    global lastBatteryWarning, batteryThreshold
    battery := GetSystemPowerStatus()
    if !battery.ACLineStatus && battery.BatteryLifePercent <= batteryThreshold {
        currentTime := A_TickCount
        if (currentTime - lastBatteryWarning > 300000) { ; 5 minutes
            ToolTip("⚠️ Low Battery: " battery.BatteryLifePercent "%")
            SetTimer () => ToolTip(), -5000
            lastBatteryWarning := currentTime
        }
    }
}

GetSystemPowerStatus()
{
    try {
        powerStatus := ComObject("UIAutomation").CreatePropertyCondition(30045, 0)
        return {
            ACLineStatus: powerStatus.CurrentPropertyValue,
            BatteryLifePercent: Round(powerStatus.CurrentPropertyValue * 100)
        }
    }
    catch {
        return { ACLineStatus: 1, BatteryLifePercent: 100 }
    }
}

; -------------------------
; 🖱️ Mouse Position Management
; -------------------------
F10::
{
    global currentX, currentY, savedPositions
    MouseGetPos(&currentX, &currentY)
    savedPositions.Push({ x: currentX, y: currentY })
    ToolTip("📍 Position saved: " currentX "," currentY)
    SetTimer () => ToolTip(), -1000
    LogActivity("Saved mouse position: " currentX "," currentY)
}

F11::
{
    global savedPositions
    savedPositions := []
    ToolTip("🗑️ Cleared saved positions")
    SetTimer () => ToolTip(), -1000
    LogActivity("Cleared saved positions")
}

; -------------------------
; ⌨️ Typing Simulation Toggle
; -------------------------
F9::
{
    global typeSimulationEnabled
    typeSimulationEnabled := !typeSimulationEnabled
    ToolTip("Typing Simulation: " (typeSimulationEnabled ? "Enabled" : "Disabled"))
    SetTimer () => ToolTip(), -1000
    LogActivity("Typing simulation " (typeSimulationEnabled ? "enabled" : "disabled"))
}

; -------------------------
; 🚀 Start/Stop Automation
; -------------------------
F6::
{
    global isRunning, intervalSeconds, moveMouseEnabled, switchTabsEnabled
    isRunning := !isRunning
    if isRunning {
        StartAutomation()
        ToolTip("✅ Automation Started`nInterval: " intervalSeconds "s`nMouse: " (moveMouseEnabled ? "On" : "Off") "`nTabs: " (switchTabsEnabled ? "On" : "Off"))
    } else {
        StopAutomation()
        ToolTip("⛔ Automation Stopped")
    }
    SetTimer () => ToolTip(), -2000
}

; -------------------------
; 🖱️ Toggle Mouse Movement
; -------------------------
F7::
{
    global moveMouseEnabled
    moveMouseEnabled := !moveMouseEnabled
    ToolTip("Mouse Movement: " (moveMouseEnabled ? "Enabled" : "Disabled"))
    SetTimer () => ToolTip(), -1000
}

; -------------------------
; 🌐 Toggle Tab Switching
; -------------------------
F8::
{
    global switchTabsEnabled
    switchTabsEnabled := !switchTabsEnabled
    ToolTip("Tab Switching: " (switchTabsEnabled ? "Enabled" : "Disabled"))
    SetTimer () => ToolTip(), -1000
}

; -------------------------
; ⏱️ Interval Adjust (Ctrl+Up/Down)
; -------------------------
^Up::
{
    global intervalSeconds
    intervalSeconds += 5
    ToolTip("Interval: " intervalSeconds " seconds")
    SetTimer () => ToolTip(), -1000
}

^Down::
{
    global intervalSeconds
    if intervalSeconds > 5 {
        intervalSeconds -= 5
        ToolTip("Interval: " intervalSeconds " seconds")
        SetTimer () => ToolTip(), -1000
    }
}

; -------------------------
; ℹ️ Show Current Settings (Ctrl+Alt+P)
; -------------------------
^!p::
{
    global isRunning, intervalSeconds, moveMouseEnabled, switchTabsEnabled, typeSimulationEnabled
    global mouseSpeed, savedPositions, batteryThreshold
    MsgBox(
        "📋 Current Settings:`n`n"
        . "Status: " (isRunning ? "Running" : "Stopped") "`n"
        . "Interval: " intervalSeconds " seconds`n"
        . "Mouse Movement: " (moveMouseEnabled ? "Enabled" : "Disabled") "`n"
        . "Tab Switching: " (switchTabsEnabled ? "Enabled" : "Disabled") "`n"
        . "Typing Simulation: " (typeSimulationEnabled ? "Enabled" : "Disabled") "`n"
        . "Mouse Speed: " mouseSpeed " pixels`n"
        . "Saved Positions: " savedPositions.Length "`n"
        . "Battery Warning: " batteryThreshold "%",
        "Automation Settings"
    )
}

; -------------------------
; 🛑 Emergency Stop (Ctrl + Esc)
; -------------------------
^Escape::
{
    global isRunning
    isRunning := false
    StopAutomation()
    ToolTip("🛑 Emergency Stop Activated")
    SetTimer () => ToolTip(), -2000
}

; -------------------------
; 🔁 Automation Timer Control
; -------------------------
StartAutomation()
{
    global intervalSeconds
    SetTimer(AutomationLoop, intervalSeconds * 1000)
}

StopAutomation()
{
    SetTimer(AutomationLoop, 0)
}

; -------------------------
; 🔄 Main Automation Loop
; -------------------------
AutomationLoop()
{
    global isRunning, moveMouseEnabled, switchTabsEnabled, typeSimulationEnabled
    global currentX, currentY, mouseSpeed, savedPositions, typingPhrases

    if !isRunning
        return

    CheckBatteryLevel()
    MouseGetPos(&currentX, &currentY)

    ; 🔹 Simulate Mouse Movement & Random Clicks
    if moveMouseEnabled {
        if savedPositions.Length > 0 && Random(1, 4) = 1 {
            ; Sometimes move to a saved position
            randomPos := savedPositions[Random(1, savedPositions.Length)]
            MouseMove(randomPos.x, randomPos.y, 10)
            LogActivity("Moved to saved position: " randomPos.x "," randomPos.y)
        } else {
            ; Random movement
            dx := Random(-mouseSpeed, mouseSpeed)
            dy := Random(-mouseSpeed, mouseSpeed)
            MouseMove(currentX + dx, currentY + dy, 10)
        }

        if Random(1, 10) = 5 {
            Click()
            LogActivity("Performed mouse click")
        }
    }

    ; 🔹 Simulate Typing
    if typeSimulationEnabled && Random(1, 5) = 1 {
        if WinActive("ahk_class Notepad") || WinActive("ahk_class ConsoleWindowClass") {
            randomPhrase := typingPhrases[Random(1, typingPhrases.Length)]
            SendText(randomPhrase)
            Send("{Enter}")
            LogActivity("Typed: " randomPhrase)
        }
    }

    ; 🔹 Simulate Browser Tab Switching & Scrolling
    if switchTabsEnabled {
        winTitle := WinGetTitle("A")
        browserActive := false
        
        ; Check for various browser window classes
        if WinActive("ahk_class Chrome_WidgetWin_1") || WinActive("ahk_class MozillaWindowClass") 
            || WinActive("ahk_class ApplicationFrameWindow")  ; Edge
            || InStr(winTitle, "Chrome") || InStr(winTitle, "Firefox") || InStr(winTitle, "Edge") || InStr(winTitle, "Brave") {
            browserActive := true
        }
        
        if browserActive {
            ; Tab Switch with small delay
            Send("{Ctrl down}{Tab}")
            Sleep(100)
            Send("{Ctrl up}")
            Sleep(500)
            LogActivity("Switched browser tab")
            
            ; Random scrolling
            if Random(1, 2) = 1 {
                scrollAmount := Random(1, 3)
                Loop scrollAmount {
                    Send("{WheelDown}")
                    Sleep(200)
                }
                LogActivity("Scrolled down " scrollAmount " times")
            }
        }
    }

    ; 🔹 Random Window Switching
    if Random(1, 20) = 1 {
        Send("{Alt down}{Tab}")
        Sleep(100)
        Send("{Alt up}")
        LogActivity("Switched windows")
    }
}

; -------------------------
; 📊 Show Current Settings (Updated)
; -------------------------
^!p::
{
    global isRunning, intervalSeconds, moveMouseEnabled, switchTabsEnabled, typeSimulationEnabled
    global mouseSpeed, savedPositions, batteryThreshold
    MsgBox(
        "📋 Current Settings:`n`n"
        . "Status: " (isRunning ? "Running" : "Stopped") "`n"
        . "Interval: " intervalSeconds " seconds`n"
        . "Mouse Movement: " (moveMouseEnabled ? "Enabled" : "Disabled") "`n"
        . "Tab Switching: " (switchTabsEnabled ? "Enabled" : "Disabled") "`n"
        . "Typing Simulation: " (typeSimulationEnabled ? "Enabled" : "Disabled") "`n"
        . "Mouse Speed: " mouseSpeed " pixels`n"
        . "Saved Positions: " savedPositions.Length "`n"
        . "Battery Warning: " batteryThreshold "%",
        "Automation Settings"
    )
}

; -------------------------
; 📝 Show Activity Log
; -------------------------
^!l::ShowActivityLog() 