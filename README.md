# Stimulus demonstrations

Interactive stimulus patterns used to induce optokinetic nystagmus (OKN), and a set of digital image demonstrations.
Eye Health & Diagnostics Group, Auckland Bioengineering Institute, University of Auckland.

**Live site:** <https://abi-eye-group.github.io/>

---

## Contents

| Demonstration | Page | What it is |
|---|---|---|
| Disks (size sweep) | [`gratings.html?stimulus=disks&sweep=1`](https://abi-eye-group.github.io/gratings.html?stimulus=disks&sweep=1) | Drifting centre/surround disks. With Sweep on, the central disk size steps down through logMAR levels and back up. |
| Bars | [`gratings.html?stimulus=bars`](https://abi-eye-group.github.io/gratings.html?stimulus=bars) | Drifting square-wave stripes. |
| Sinusoids | [`gratings.html?stimulus=sinusoids`](https://abi-eye-group.github.io/gratings.html?stimulus=sinusoids) | Drifting sinusoidal gratings. |
| Moving Gabors | [`preferential.html`](https://abi-eye-group.github.io/preferential.html) | A Gabor patch that jumps between positions, or sweeps across the screen. |
| Digital image demonstrations | cards on the index page | Gabor patch explorer, magnitude and phase, Fourier image explorer, hybrid image creator (hosted on the School of Optometry and Vision Science site, OPTOM 263). |

---

## How to use the stimulus demonstrations

1. Open the page (for example `gratings.html`) in **Chrome**.
2. **Calibrate the screen (optional).** On the start screen press *Calibrate with a credit card*, hold a card flat against the screen and match the rectangle to it. The result is remembered in the browser. *Skip* (or `?calibrate=0`) uses the Display Options as they are.
3. **Press "Press here to enter experiment".** The page goes full screen and the stimulus starts, with the controller at the top right.
4. **Check the Display Options** (below) if you have not calibrated, so sizes and speeds are in true degrees at your viewing distance.
5. Change the stimulus and its parameters with the controller. Changes apply as you release a control.
6. Press **Esc** to leave full screen. The start button returns.

A link can choose the demonstration directly: `gratings.html?stimulus=disks|bars|sinusoids` and, for disks, `&sweep=1` or `&sweep=0`.

---

## Controller options

### Main

| Option | Default | Meaning |
|---|---|---|
| **Stimulus** | disks | `disks` \| `bars` \| `sinusoids` |
| **logMAR** | 1.0 | Size of the stimulus. disks: angular size of the central disk. bars: stripe width. sinusoids: wavelength / 2. |
| **Speed** (deg/s) | 2.5 | Horizontal drift speed of the stimulus (0 to 15). |
| **Direction** | left | Horizontal drift direction: `left` \| `right`. |
| **Distance** (cm) | 100 | Distance of the observer from the display: 50, 70, 100, 150 or 300. |
| **Sweep** | on | Only for `disks`. Overrides the logMAR control while it is on. |

### Sweep options (disks only)

| Option | Default | Meaning |
|---|---|---|
| **Step Duration** (s) | 0.5 | Time spent at each logMAR level. |
| *Step size* | 0.1 logMAR | Size of each step (not in the controller). |

### Stimulus options

**Disks**

| Option | Default | Meaning |
|---|---|---|
| Ratio | 1:2 | Central disk : surround disk diameter. |
| Central Intensity | 0.75 | Normalised pixel intensity of the central disk. |
| Surround Intensity | 0.45 | Normalised pixel intensity of the surround disk. |
| Spacing | 2 deg | Angular distance between disks. |

**Bars and sinusoids**

| Option | Default | Meaning |
|---|---|---|
| Contrast | 1 | Michelson contrast. |

### Display options

These scale the stimulus to your screen. Fill them in for each set-up.

| Option | Meaning |
|---|---|
| **Height (cm)** | Physical screen height. |
| **Width (cm)** | Physical screen width. |
| **Height (px)** | Screen height in logical pixels. |
| **Width (px)** | Screen width in logical pixels. |
| **Device Pixel Ratio** | Ratio of physical to logical pixels (1 on a standard display; 2 on many retina displays). |

Tip: [screenresolutiontest.com](https://screenresolutiontest.com) reports the screen's pixel size.

---

## Tips

* The demonstrations work best in [Chrome](https://www.google.com/chrome/).
* Motion artefacts (comet tails) are typical on LED monitors. [Blur reduction](https://blurbusters.com) helps.
  * We have routinely used nVidia's Ultra Low Motion Blur (ULMB), which works. We have not tried [ULMB2](https://www.nvidia.com/en-us/geforce/news/g-sync-ultra-low-motion-blur-2/).
  * A high refresh rate OLED tablet (a Samsung Galaxy Tab S8 Ultra) gave artefact-free motion.
* Check the Display options before running anything quantitative.

---

## Digital image demonstrations

Linked from the index page and hosted at <https://sovs-uoa.github.io/demo/>:

* **Gabor patch explorer**: set frequency, orientation, phase, envelope and position, and see the amplitude spectrum.
* **Magnitude and phase**: one co-sinusoid described by cosine and sine weights (R, I) or by magnitude and phase.
* **Fourier image explorer**: load an image, see its magnitude and phase spectra, and apply ideal, Gaussian or Butterworth filters.
* **Hybrid image creator**: blend the low frequencies of one image with the high frequencies of another.

---

## Licence

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
