# RNCM PRiSM Gesture Tracker Demo

Live deployment on Cloudflare Pages available [here](https://gesturetracker.pages.dev/).

## ABOUT

Demo version of the gesture tracking app developed at [RNCM PRiSM](https://www.rncm.ac.uk/research/research-centres-rncm/prism) for the piece *Forager*, by composer and computer music pioneer [George Lewis](https://music.columbia.edu/bios/george-e-lewis).

The app uses a [*k*-Nearest-Neighbours](https://en.wikipedia.org/wiki/K-nearest_neighbors_algorithm) (*k*-NN) model with [Dynamic Time Warping](https://en.wikipedia.org/wiki/Dynamic_time_warping) (DTW) to track a specific set of musical gestures in real time.

For pitch estimation it makes use of CREPE. The demo is inspired by the (Chrome only) [CREPE demo site](https://marl.github.io/crepe/).

This is a mono version of the app using the Web Audio API, and was not used in the first performance of *Forager*.

The full code for the production app will be released by RNCM PRiSM shortly. The production version uses [SoX](https://sox.sourceforge.net/) - the 'Swiss Army knife' of sound processing - for audio capture. It is multi-channel, and works with a mic or audio interface connected to a local machine.

## ACKNOWLEDGEMENTS

Lead Developer: [Dr Christopher Melen](https://www.rncm.ac.uk/people/christopher-melen/) (PRiSM Research Software Engineer).

With invaluable contributions from [Professor David De Roure](https://www.rncm.ac.uk/research/research-centres-rncm/prism/prism-blog/meet-the-prism-technical-director/), [Dr Bofan Ma](https://www.rncm.ac.uk/research/research-centres-rncm/prism/prism-news/dr-bofan-ma-appointed-rncm-prism-post-doctoral-research-associate/), George Lewis and [Damon Holzborn](https://music.columbia.edu/bios/damon-holzborn).
