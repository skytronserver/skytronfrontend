#Requires AutoHotkey v2.0

; Automated Browser Tab and Mouse Control Script
; Hotkeys:
; F6 - Start/Stop automation
; F7 - Toggle tab switching
; F8 - Toggle mouse movement
; Ctrl + Up/Down - Adjust interval time
; Ctrl + Alt + P - Show current settings

; Settings
global isRunning := false
global moveMouseEnabled := true
global switchTabsEnabled := true
global intervalSeconds := 30  ; Default interval (30 seconds)
global mouseSpeed := 50      ; Pixels to move per movement
global currentX := 0         ; Track current X position
global currentY := 0         ; Track current Y position
global movePattern := 1      ; Current movement pattern (1-4)

; Start/Stop Automation
F6::
{
    isRunning := !isRunning
    if (isRunning) {
        StartAutomation()
        ToolTip("Automation Started`nInterval: " intervalSeconds " seconds`nMouse: " (moveMouseEnabled ? "On" : "Off") "`nTabs: " (switchTabsEnabled ? "On" : "Off"))
    } else {
        StopAutomation()
        ToolTip("Automation Stopped")
    }
    SetTimer () => ToolTip(), -2000
}

; Toggle Mouse Movement
F7::
{
    moveMouseEnabled := !moveMouseEnabled
    ToolTip("Mouse Movement: " (moveMouseEnabled ? "Enabled" : "Disabled"))
    SetTimer () => ToolTip(), -1000
}

; Toggle Tab Switching
F8::
{
    switchTabsEnabled := !switchTabsEnabled
    ToolTip("Tab Switching: " (switchTabsEnabled ? "Enabled" : "Disabled"))
    SetTimer () => ToolTip(), -1000
}

; Adjust Interval (Ctrl + Up/Down)
^Up::
{
    intervalSeconds += 5
    ToolTip("Interval: " intervalSeconds " seconds")
    SetTimer () => ToolTip(), -1000
}

^Down::
{
    if (intervalSeconds > 5) {
        intervalSeconds -= 5
        ToolTip("Interval: " intervalSeconds " seconds")
        SetTimer () => ToolTip(), -1000
    }
}

; Show Current Settings
^!p::
{
    MsgBox(
        "Current Settings:`n`n" .
        "Status: " (isRunning ? "Running" : "Stopped") "`n" .
        "Interval: " intervalSeconds " seconds`n" .
        "Mouse Movement: " (moveMouseEnabled ? "Enabled" : "Disabled") "`n" .
        "Tab Switching: " (switchTabsEnabled ? "Enabled" : "Disabled") "`n" .
        "Mouse Speed: " mouseSpeed " pixels",
        "Automation Settings"
    )
}

; Main automation function
StartAutomation()
{
    SetTimer(AutomationLoop, intervalSeconds * 1000)
}

StopAutomation()
{
    SetTimer(AutomationLoop, 0)
}

AutomationLoop()
{
    if (!isRunning) {
        return
    }

    ; Get current mouse position
    MouseGetPos(&currentX, &currentY)

    ; Mouse movement patterns
    if (moveMouseEnabled) {
        Switch movePattern {
            case 1: ; Square pattern
                MouseMove(currentX + mouseSpeed, currentY, 0)
                Sleep(100)
                MouseMove(currentX + mouseSpeed, currentY + mouseSpeed, 0)
                Sleep(100)
                MouseMove(currentX, currentY + mouseSpeed, 0)
                Sleep(100)
                MouseMove(currentX, currentY, 0)
            case 2: ; Circle-like pattern
                MouseMove(currentX + mouseSpeed, currentY, 0)
                Sleep(100)
                MouseMove(currentX + mouseSpeed, currentY + mouseSpeed, 0)
                Sleep(100)
                MouseMove(currentX, currentY + mouseSpeed, 0)
                Sleep(100)
                MouseMove(currentX - mouseSpeed, currentY, 0)
            case 3: ; Diagonal pattern
                MouseMove(currentX + mouseSpeed, currentY + mouseSpeed, 0)
                Sleep(100)
                MouseMove(currentX - mouseSpeed, currentY - mouseSpeed, 0)
            case 4: ; Zigzag pattern
                MouseMove(currentX + mouseSpeed, currentY + mouseSpeed, 0)
                Sleep(100)
                MouseMove(currentX + mouseSpeed, currentY - mouseSpeed, 0)
                Sleep(100)
                MouseMove(currentX - mouseSpeed, currentY + mouseSpeed, 0)
                Sleep(100)
                MouseMove(currentX - mouseSpeed, currentY - mouseSpeed, 0)
        }
        
        ; Change pattern for next iteration
        movePattern := Mod(movePattern, 4) + 1
    }

    ; Tab switching
    if (switchTabsEnabled) {
        if WinActive("ahk_class Chrome_WidgetWin_1") or WinActive("ahk_class MozillaWindowClass")
        {
            Send "^{PgDn}"  ; Next tab
            Sleep(500)      ; Wait half second
            Send "^{PgUp}"  ; Previous tab
        }
    }
}

; Emergency stop (Ctrl + Esc)
^Escape::
{
    isRunning := false
    StopAutomation()
    ToolTip("Emergency Stop Activated")
    SetTimer () => ToolTip(), -2000
} 