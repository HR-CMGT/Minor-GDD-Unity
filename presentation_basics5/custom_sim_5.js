// ==========================================
// CLASS 5 INTERACTIVE SIMULATORS
// ==========================================

// 1. Screen Fader Simulator (Slide 5)
let simFaderActive = false;
let simFaderDuration = 3.5; // Duration in seconds (1.0s to 10.0s)
let simBlockedSpamCount = 0;
let simSpamBannerTimeout = null;

function simOnSpeedSliderChange(val) {
    simFaderDuration = Math.max(1, Math.min(10, parseFloat(val) || 3.5));
    const label = document.getElementById('simSpeedVal');
    if (label) {
        label.textContent = simFaderDuration.toFixed(1) + 's';
    }
}

function simSetFaderSpeed(val) {
    if (typeof val === 'number') {
        simOnSpeedSliderChange(val);
    } else if (val === 'slow') {
        simOnSpeedSliderChange(6.0);
    } else if (val === 'fast') {
        simOnSpeedSliderChange(1.5);
    }
    const slider = document.getElementById('simFaderSpeedSlider');
    if (slider) slider.value = simFaderDuration;
}

function simUpdateStepIndicator(activeStep) {
    for (let i = 1; i <= 4; i++) {
        const stepEl = document.getElementById('simStep' + i);
        if (!stepEl) continue;
        if (i === activeStep) {
            stepEl.style.background = '#0369a1';
            stepEl.style.borderColor = '#38bdf8';
            stepEl.style.color = '#ffffff';
            stepEl.style.boxShadow = '0 0 10px rgba(56, 189, 248, 0.35)';
        } else if (i < activeStep) {
            stepEl.style.background = '#064e3b';
            stepEl.style.borderColor = '#10b981';
            stepEl.style.color = '#a7f3d0';
            stepEl.style.boxShadow = 'none';
        } else {
            stepEl.style.background = '#1e293b';
            stepEl.style.borderColor = '#334155';
            stepEl.style.color = '#94a3b8';
            stepEl.style.boxShadow = 'none';
        }
    }
}

function simTransitionScene(targetScene) {
    const curtain = document.getElementById('simBlackCurtain');
    const alphaText = document.getElementById('simAlphaText');
    const sceneName = document.getElementById('simSceneName');
    const lockoutBadge = document.getElementById('simLockoutBadge');
    const spamStatus = document.getElementById('simSpamStatus');
    const codeEl = document.getElementById('simFaderCode');
    const spamBanner = document.getElementById('simSpamAlertBanner');
    const spamBadge = document.getElementById('simSpamCounterBadge');

    if (simFaderActive) {
        simBlockedSpamCount++;
        if (spamBadge) spamBadge.textContent = simBlockedSpamCount;
        if (spamBanner) {
            spamBanner.innerHTML = '<strong>[RACE CONDITION BLOCKED]</strong> Discarded duplicate request for <code>' + targetScene + '</code>! Raycasts are locked (<code>_isTransitioning == true</code>).';
            spamBanner.style.display = 'block';
            clearTimeout(simSpamBannerTimeout);
            simSpamBannerTimeout = setTimeout(() => {
                spamBanner.style.display = 'none';
            }, 3000);
        }
        if (spamStatus) {
            spamStatus.textContent = '[BLOCKED] Spam click rejected!';
            spamStatus.style.color = '#ef4444';
        }
        return;
    }

    simFaderActive = true;
    const totalMs = simFaderDuration * 1000;
    const lockDelay = Math.max(100, Math.round(totalMs * 0.10));
    const fadeDuration = Math.max(250, Math.round(totalMs * 0.35));
    const holdDarkDelay = Math.max(200, Math.round(totalMs * 0.20));

    // Phase 1: Lock Input
    simUpdateStepIndicator(1);
    if (lockoutBadge) {
        lockoutBadge.textContent = 'Raycasts: BLOCKED (Input Locked)';
        lockoutBadge.style.background = '#7f1d1d';
        lockoutBadge.style.color = '#fecaca';
    }
    if (spamStatus) {
        spamStatus.textContent = 'Phase 1: Input locked...';
        spamStatus.style.color = '#f59e0b';
    }
    if (codeEl) {
        codeEl.innerHTML = '<code><span class="r-cm">// PHASE 1: LOCK INPUT IMMEDIATELY</span><br>' +
            '_isTransitioning = <span class="r-kw">true</span>;<br>' +
            'canvasGroup.blocksRaycasts = <span class="r-kw">true</span>; <span class="r-cm">// Touch input blocked!</span><br><br>' +
            '<span class="r-cm">// Spamming buttons now will be safely ignored.</span></code>';
    }

    setTimeout(() => {
        // Phase 2: Fade to black
        simUpdateStepIndicator(2);
        if (spamStatus) {
            spamStatus.textContent = 'Phase 2: Fading alpha 0.00 -> 1.00...';
            spamStatus.style.color = '#38bdf8';
        }
        if (codeEl) {
            codeEl.innerHTML = '<code><span class="r-cm">// PHASE 2: FADE OUT USING UNSCALED TIME</span><br>' +
                '<span class="r-kw">while</span> (canvasGroup.alpha &lt; 1f) {<br>' +
                '    canvasGroup.alpha += Time.unscaledDeltaTime * speed;<br>' +
                '    <span class="r-kw">yield return null</span>; <span class="r-cm">// Runs even if Time.timeScale == 0</span><br>}</code>';
        }

        const startTime = Date.now();
        const fadeStep = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(1.0, elapsed / fadeDuration);
            if (curtain) curtain.style.opacity = progress;
            if (alphaText) alphaText.textContent = progress.toFixed(2);

            if (progress < 1.0) {
                requestAnimationFrame(fadeStep);
            } else {
                // Phase 3: Darkness Hold & Scene Swap
                simUpdateStepIndicator(3);
                if (curtain) curtain.style.opacity = 1.0;
                if (alphaText) alphaText.textContent = '1.00';
                if (spamStatus) {
                    spamStatus.textContent = 'Phase 3: Loading ' + targetScene + ' in dark...';
                    spamStatus.style.color = '#a855f7';
                }
                if (codeEl) {
                    codeEl.innerHTML = '<code><span class="r-cm">// PHASE 3: ASYNC LOAD IN COMPLETE DARKNESS</span><br>' +
                        '<span class="r-cm">// Zero stutter or popping visible to player</span><br>' +
                        'AsyncOperation op = SceneManager.LoadSceneAsync(<span class="r-str">"' + targetScene + '"</span>);<br>' +
                        '<span class="r-kw">while</span> (!op.isDone) <span class="r-kw">yield return null</span>;</code>';
                }

                setTimeout(() => {
                    if (sceneName) sceneName.textContent = targetScene;
                    if (spamStatus) {
                        spamStatus.textContent = 'Phase 3: ' + targetScene + ' loaded!';
                        spamStatus.style.color = '#10b981';
                    }

                    setTimeout(() => {
                        // Phase 4: Fade Back In
                        simUpdateStepIndicator(4);
                        if (spamStatus) {
                            spamStatus.textContent = 'Phase 4: Fading alpha 1.00 -> 0.00...';
                            spamStatus.style.color = '#38bdf8';
                        }
                        if (codeEl) {
                            codeEl.innerHTML = '<code><span class="r-cm">// PHASE 4: REVEAL SCENE & RESTORE RAYCASTS</span><br>' +
                                '<span class="r-kw">while</span> (canvasGroup.alpha &gt; 0f) {<br>' +
                                '    canvasGroup.alpha -= Time.unscaledDeltaTime * speed;<br>' +
                                '    <span class="r-kw">yield return null</span>;<br>}</code>';
                        }

                        const outStartTime = Date.now();
                        const outFadeStep = () => {
                            const outElapsed = Date.now() - outStartTime;
                            const outProgress = Math.max(0.0, 1.0 - (outElapsed / fadeDuration));
                            if (curtain) curtain.style.opacity = outProgress;
                            if (alphaText) alphaText.textContent = outProgress.toFixed(2);

                            if (outProgress > 0.0) {
                                requestAnimationFrame(outFadeStep);
                            } else {
                                // Phase 5: Complete & Unlock
                                if (curtain) curtain.style.opacity = 0;
                                if (alphaText) alphaText.textContent = '0.00';
                                if (lockoutBadge) {
                                    lockoutBadge.textContent = 'Raycasts: Active (Input Unlocked)';
                                    lockoutBadge.style.background = '#1e293b';
                                    lockoutBadge.style.color = '#94a3b8';
                                }
                                if (spamStatus) {
                                    spamStatus.textContent = 'Ready (' + targetScene + ' active)';
                                    spamStatus.style.color = '#4ade80';
                                }
                                if (codeEl) {
                                    codeEl.innerHTML = '<code><span class="r-cm">// PHASE 4 COMPLETE: UNLOCK INPUT</span><br>' +
                                        'canvasGroup.blocksRaycasts = <span class="r-kw">false</span>; <span class="r-cm">// Interactive again</span><br>' +
                                        '_isTransitioning = <span class="r-kw">false</span>;</code>';
                                }
                                simUpdateStepIndicator(0);
                                simFaderActive = false;
                            }
                        };
                        requestAnimationFrame(outFadeStep);
                    }, holdDarkDelay / 2);
                }, holdDarkDelay / 2);
            }
        };
        requestAnimationFrame(fadeStep);
    }, lockDelay);
}

function simSpamClick() {
    simTransitionScene('Level_01');
    const delay1 = Math.max(100, Math.round(simFaderDuration * 100));
    const delay2 = Math.max(200, Math.round(simFaderDuration * 220));
    setTimeout(() => {
        simTransitionScene('Level_02'); // This should be blocked!
    }, delay1);
    setTimeout(() => {
        simTransitionScene('MainMenu'); // This should also be blocked!
    }, delay2);
}

// 2. Game Feel & Audio Playground (Slide 13)
function simTactilePress(isDown) {
    const btn = document.getElementById('btnTactileTest');
    const scaleText = document.getElementById('simButtonScaleText');
    const codeEl = document.getElementById('simFeelCode');
    const tag = document.getElementById('simFeelFileTag');

    if (tag) tag.textContent = 'TactileButton.cs';

    if (isDown) {
        if (btn) btn.style.transform = 'scale(0.92)';
        if (scaleText) { scaleText.textContent = '0.92x (Depressed)'; scaleText.style.color = '#f59e0b'; }
        if (codeEl) {
            codeEl.innerHTML = '<code><span class="r-kw">public void</span> OnPointerDown(PointerEventData e) {<br>' +
                '    <span class="r-cm">// Depress scale by 8% under player thumb</span><br>' +
                '    transform.localScale = _baseScale * <span class="r-num">0.92f</span>;<br>}</code>';
        }
    } else {
        if (btn) btn.style.transform = 'scale(1.0)';
        if (scaleText) { scaleText.textContent = '1.00x (Released)'; scaleText.style.color = '#38bdf8'; }
        if (codeEl) {
            codeEl.innerHTML = '<code><span class="r-kw">public void</span> OnPointerUp(PointerEventData e) {<br>' +
                '    <span class="r-cm">// Snap back to original scale on release</span><br>' +
                '    transform.localScale = _baseScale;<br>}</code>';
        }
    }
}

function simTriggerPopup() {
    const popup = document.getElementById('simModalPopup');
    const codeEl = document.getElementById('simFeelCode');
    const tag = document.getElementById('simFeelFileTag');
    if (tag) tag.textContent = 'UIMicroBounce.cs';

    if (!popup) return;
    popup.style.transform = 'scale(0)';
    setTimeout(() => {
        popup.style.transform = 'scale(1)';
    }, 20);

    if (codeEl) {
        codeEl.innerHTML = '<code><span class="r-cm">// Procedural Elastic Bounce with AnimationCurve</span><br>' +
            '<span class="r-kw">float</span> scale = popCurve.Evaluate(timer / duration);<br>' +
            'transform.localScale = Vector3.one * scale;<br>' +
            '<span class="r-cm">// Overshoots to 1.15x before settling at 1.00x!</span></code>';
    }
}

function simPlayAudio(type) {
    const pitchText = document.getElementById('simPitchText');
    const codeEl = document.getElementById('simFeelCode');
    const tag = document.getElementById('simFeelFileTag');
    if (tag) tag.textContent = 'UniversalAudioFeedback.cs';

    const randomPitch = (0.94 + Math.random() * 0.12).toFixed(2);
    if (pitchText) {
        pitchText.textContent = randomPitch + 'x';
        pitchText.style.color = '#fbbf24';
        setTimeout(() => { if (pitchText) pitchText.style.color = '#4ade80'; }, 600);
    }

    if (codeEl) {
        codeEl.innerHTML = '<code><span class="r-kw">public void</span> PlaySuccess() {<br>' +
            '    <span class="r-cm">// Subtle pitch variation (+/- 6%) prevents ear fatigue!</span><br>' +
            '    sfxSource.pitch = Random.Range(<span class="r-num">0.94f</span>, <span class="r-num">1.06f</span>); <span class="r-cm">// ' + randomPitch + 'x</span><br>' +
            '    sfxSource.PlayOneShot(chimeSuccess);<br>}</code>';
    }
}

function simScreenFlash() {
    const flash = document.getElementById('simFlashOverlay');
    const codeEl = document.getElementById('simFeelCode');
    const tag = document.getElementById('simFeelFileTag');
    if (tag) tag.textContent = 'ScreenFlash.cs';

    if (flash) {
        flash.style.opacity = '0.7';
        setTimeout(() => { if (flash) flash.style.opacity = '0'; }, 80);
    }

    if (codeEl) {
        codeEl.innerHTML = '<code><span class="r-cm">// Milestone Canvas Flash (60ms pulse)</span><br>' +
            'flashCanvasGroup.alpha = <span class="r-num">0.7f</span>;<br>' +
            'StartCoroutine(FadeOutFlash(<span class="r-num">0.08f</span>));</code>';
    }
}

// 3. Leaderboard & Telemetry Simulator (Slide 18)
let isSimOffline = false;
let simLeaderboardData = [
    { name: "Jordan", score: 1240 },
    { name: "Sam", score: 980 },
    { name: "Taylor", score: 740 }
];
let simSessionCounter = 4820;

function renderSimLeaderboard() {
    const listEl = document.getElementById('simLeaderboardList');
    if (!listEl) return;
    listEl.innerHTML = simLeaderboardData
        .map((e, idx) => (idx + 1) + '. ' + e.name + ' - ' + e.score + ' pts')
        .join('<br>');
}

function simSubmitLeaderboard() {
    const nameInput = document.getElementById('inputPlayerName');
    const scoreInput = document.getElementById('inputPlayerScore');
    const codeEl = document.getElementById('simWebCode');
    const tag = document.getElementById('simWebFileTag');
    if (tag) tag.textContent = 'OnlineLeaderboard.cs';

    const name = (nameInput && nameInput.value) ? nameInput.value : 'Anonymous';
    const score = (scoreInput && scoreInput.value) ? parseInt(scoreInput.value, 10) : 500;

    if (isSimOffline) {
        if (codeEl) {
            codeEl.innerHTML = '<code><span class="r-cm">// [OFFLINE FALLBACK ACTIVATED]</span><br>' +
                '<span class="r-kw">if</span> (Application.internetReachability == NotReachable) {<br>' +
                '    PlayerPrefs.SetInt(<span class="r-str">"LocalHighScore"</span>, ' + score + ');<br>' +
                '    Debug.Log(<span class="r-str">"Offline: Saved locally to PlayerPrefs!"</span>);<br>}</code>';
        }
        return;
    }

    simLeaderboardData.push({ name: name, score: score });
    simLeaderboardData.sort((a, b) => b.score - a.score);
    if (simLeaderboardData.length > 5) simLeaderboardData = simLeaderboardData.slice(0, 5);
    renderSimLeaderboard();

    if (codeEl) {
        codeEl.innerHTML = '<code><span class="r-cm">// 1. DISPATCH TO DREAMLO REST API</span><br>' +
            '<span class="r-kw">string</span> url = <span class="r-str">"http://dreamlo.com/lb/KEY/add/"</span> + UnityWebRequest.EscapeURL(<span class="r-str">"' + name + '"</span>) + <span class="r-str">"/' + score + '"</span>;<br>' +
            '<span class="r-kw">using</span> (UnityWebRequest www = UnityWebRequest.Get(url)) {<br>' +
            '    <span class="r-kw">yield return</span> www.SendWebRequest();<br>' +
            '    <span class="r-cm">// [HTTP 200 OK] Score posted to Global Leaderboard!</span><br>}</code>';
    }
}

function simDispatchTelemetry() {
    simSessionCounter++;
    const rowsEl = document.getElementById('simSheetRows');
    const codeEl = document.getElementById('simWebCode');
    const tag = document.getElementById('simWebFileTag');
    if (tag) tag.textContent = 'PlaytestTelemetry.cs';

    const timeNow = new Date().toTimeString().split(' ')[0];
    const newRow = '[' + timeNow + '] Session #' + simSessionCounter + ' | Lvl ' + Math.floor(1 + Math.random() * 4) + ' | ' + Math.floor(60 + Math.random() * 120) + 's | ' + Math.floor(Math.random() * 4) + ' Fails';

    if (rowsEl) {
        rowsEl.innerHTML = newRow + '<br>' + rowsEl.innerHTML;
    }

    if (codeEl) {
        codeEl.innerHTML = '<code><span class="r-cm">// 2. DISPATCH SESSION TO GOOGLE FORM</span><br>' +
            'WWWForm form = <span class="r-kw">new</span> WWWForm();<br>' +
            'form.AddField(<span class="r-str">"entry.102938475"</span>, <span class="r-str">"#' + simSessionCounter + '"</span>);<br>' +
            'form.AddField(<span class="r-str">"entry.564738291"</span>, <span class="r-str">"Level_0' + Math.floor(1 + Math.random() * 4) + '"</span>);<br><br>' +
            '<span class="r-kw">using</span> (UnityWebRequest www = UnityWebRequest.Post(GOOGLE_FORM_URL, form)) {<br>' +
            '    <span class="r-kw">yield return</span> www.SendWebRequest();<br>' +
            '    <span class="r-cm">// [HTTP 200 OK] Telemetry row appended to Google Sheet!</span><br>}</code>';
    }
}

function simToggleOffline() {
    isSimOffline = !isSimOffline;
    const netStatus = document.getElementById('simNetStatus');
    const btn = document.getElementById('btnToggleOffline');
    const codeEl = document.getElementById('simWebCode');

    if (netStatus) {
        netStatus.textContent = isSimOffline ? 'OFFLINE (Airplane)' : 'ONLINE';
        netStatus.style.color = isSimOffline ? '#ef4444' : '#4ade80';
    }
    if (btn) {
        btn.style.background = isSimOffline ? '#7f1d1d !important' : '#374151 !important';
        btn.textContent = isSimOffline ? 'Disable Airplane Mode' : 'Toggle Airplane Mode';
    }
    if (codeEl) {
        codeEl.innerHTML = isSimOffline
            ? '<code><span class="r-cm">// AIRPLANE MODE SIMULATED</span><br>' +
              'Application.internetReachability = NotReachable;<br>' +
              '<span class="r-cm">// Network calls will gracefully fall back to local cache!</span></code>'
            : '<code><span class="r-cm">// NETWORK RESTORED</span><br>' +
              'Application.internetReachability = ReachableViaCarrierDataNetwork;<br>' +
              '<span class="r-cm">// Ready to send WebRequests.</span></code>';
    }
}
