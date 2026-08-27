# Lesson 2.7: Audio Systems & Dynamic Sound in Unity

In this lesson, you learn how to implement production audio architecture in Unity. We cover the **AudioMixer**, logarithmic volume slider mathematics, **3D Spatial Sound**, and **Pitch Randomization**.

---

## 🎯 Learning Objectives
1. Structure an **AudioMixer** hierarchy (Master, Music, SFX, UI).
2. Bind UI Volume Sliders to AudioMixer **Exposed Parameters** using logarithmic decibel conversion.
3. Apply differences between **2D Audio** (UI/Music) and **3D Spatial Sound** (distance rolloff and panning).
4. Prevent repetitive audio fatigue using **Pitch & Volume Randomization**.

---

## 🎚️ 1. AudioMixer Architecture

The AudioMixer acts as an in-engine mixing console:

```
[AudioMixer: MainMixer]
  └── Master Group (Volume Master)
        ├── Music Group (BGM volume, Lowpass filters on pause)
        ├── SFX Group (Sound effects volume)
        │     └── Footsteps Group (Ducks during explosions)
        └── UI Group (Button clicks & interface sounds)
```

### AudioMixer Setup:
1. Right-click in Project View: `Create > Audio Mixer` (name it `MainMixer`).
2. Double-click `MainMixer` to open the AudioMixer window.
3. Under **Groups**, click `+` to add child groups: `Music`, `SFX`, and `UI`.
4. Route the **Output** field on all `AudioSource` components to their respective mixer groups!

---

## 📐 2. Volume Sliders & Decibel Mathematics

Connecting a UI slider ($0.0$ to $1.0$) directly to mixer attenuation is a common mistake. Human hearing is **logarithmic**, whereas sliders are linear!

### Why Decibels (-80dB to 0dB):
- At $0\text{ dB}$, volume is at full signal ($100\%$).
- At $-20\text{ dB}$, perceived loudness is halved.
- At $-80\text{ dB}$, the channel is completely muted.

### Logarithmic Conversion Formula in C#:
$$\text{dB} = \log_{10}(\text{sliderValue}) \times 20$$

---

## 💻 3. Complete AudioManager Service

Robust audio service featuring decibel conversion and pitch randomization:

```csharp
using UnityEngine;
using UnityEngine.Audio;

public class AudioManager : MonoBehaviour
{
    public static AudioManager Instance { get; private set; }

    [Header("Mixer Reference")]
    [SerializeField] private AudioMixer mainMixer;

    [Header("Audio Sources")]
    [SerializeField] private AudioSource musicSource;
    [SerializeField] private AudioSource sfxSource;

    private const string MASTER_VOLUME_PARAM = "MasterVolume";
    private const string MUSIC_VOLUME_PARAM = "MusicVolume";
    private const string SFX_VOLUME_PARAM = "SFXVolume";

    private void Awake()
    {
        if (Instance == null)
        {
            Instance = this;
            DontDestroyOnLoad(gameObject);
        }
        else
        {
            Destroy(gameObject);
        }
    }

    // 1. Logarithmic volume control for UI Sliders (Slider range: 0.0001f to 1.0f)
    public void SetMasterVolume(float sliderValue) => SetGroupVolume(MASTER_VOLUME_PARAM, sliderValue);
    public void SetMusicVolume(float sliderValue) => SetGroupVolume(MUSIC_VOLUME_PARAM, sliderValue);
    public void SetSFXVolume(float sliderValue) => SetGroupVolume(SFX_VOLUME_PARAM, sliderValue);

    private void SetGroupVolume(string parameterName, float sliderValue)
    {
        // Clamp to 0.0001f to prevent Log10(0) returning -Infinity
        float clampedValue = Mathf.Max(0.0001f, sliderValue);
        float decibels = Mathf.Log10(clampedValue) * 20f;
        mainMixer.SetFloat(parameterName, decibels);
    }

    // 2. Play sound effects with pitch randomization (prevents auditory fatigue)
    public void PlayRandomizedSFX(AudioClip clip, float minPitch = 0.9f, float maxPitch = 1.1f, float volume = 1.0f)
    {
        if (clip == null || sfxSource == null) return;

        sfxSource.pitch = Random.Range(minPitch, maxPitch);
        sfxSource.PlayOneShot(clip, volume);
    }

    // 3. Play background music
    public void PlayMusic(AudioClip musicClip, bool loop = true)
    {
        if (musicSource == null) return;

        musicSource.clip = musicClip;
        musicSource.loop = loop;
        musicSource.Play();
    }
}
```

---

## 🔊 4. 2D vs 3D Spatial Audio

On the `AudioSource` component, configure the **Spatial Blend** slider:
- **0.0 (2D):** Audio plays uniformly in stereo across both ears (Music, UI, Player Voice).
- **1.0 (3D):** Audio is positioned in 3D space with attenuation and stereo panning based on distance to the `AudioListener`.

### 3D Sound Settings:
- **Min Distance:** Distance within which audio plays at $100\%$ volume (e.g., $1.5\text{ m}$).
- **Max Distance:** Distance at which audio fades out completely (e.g., $20\text{ m}$).
- **Volume Rolloff:** Select **Logarithmic Rolloff** for realistic acoustic decay.

---

## 🛠️ Hands-on Assignment (25 minutes)

1. Create an `AudioMixer` named `MainMixer` and add the group `SFX`.
2. Right-click the Volume fader of `SFX` and select **Expose Volume (of SFX) to script**.
3. Open `Window > Audio > Audio Mixer`, click **Exposed Parameters** in the top-right, and rename it to `SFXVolume`.
4. Build a UI Slider ($0.0001$ to $1.0$) and hook up `AudioManager.Instance.SetSFXVolume` to the slider's `OnValueChanged` event.
5. Trigger sound effects on spacebar and observe natural logarithmic volume scaling!
