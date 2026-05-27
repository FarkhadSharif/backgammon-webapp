const masterFadeSeconds = 0.025;

export function createSynthEngine() {
  let audioContext = null;
  let masterGain = null;

  function getContext() {
    if (!audioContext) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      audioContext = new AudioContextClass();
      masterGain = audioContext.createGain();
      masterGain.gain.value = 0.55;
      masterGain.connect(audioContext.destination);
    }

    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }

    return audioContext;
  }

  function setVolume(volume) {
    if (!audioContext || !masterGain) {
      return;
    }

    const now = audioContext.currentTime;
    masterGain.gain.cancelScheduledValues(now);
    masterGain.gain.linearRampToValueAtTime(volume, now + 0.08);
  }

  function play(synthName, volume) {
    const context = getContext();
    setVolume(volume);

    const synth = synths[synthName] ?? synths.woodClick;
    synth(context, masterGain);
  }

  return { play, setVolume };
}

const synths = {
  woodHover: (context, destination) => playTone(context, destination, [420], 0.04, 'sine', 0.04),
  woodClick: (context, destination) => playTone(context, destination, [260, 520], 0.07, 'triangle', 0.06),
  softDice: (context, destination) => {
    playNoise(context, destination, 0.18, 0.08, 900);
    playTone(context, destination, [170, 230, 310], 0.18, 'triangle', 0.04);
  },
  checkerClick: (context, destination) => playTone(context, destination, [220, 330], 0.08, 'triangle', 0.07),
  cleanWin: (context, destination) => playSequence(context, destination, [392, 494, 587, 784], 0.1, 'sine'),
  softLose: (context, destination) => playSequence(context, destination, [330, 294, 247], 0.13, 'triangle'),
  softNotice: (context, destination) => playTone(context, destination, [660, 880], 0.09, 'sine', 0.045),
  matchStart: (context, destination) => {
    playNoise(context, destination, 0.45, 0.035, 500);
    playSequence(context, destination, [196, 247, 294], 0.16, 'sine');
  },
  dombraHover: (context, destination) => playTone(context, destination, [440, 660], 0.055, 'triangle', 0.035),
  dombraClick: (context, destination) => playTone(context, destination, [196, 392, 588], 0.085, 'triangle', 0.055),
  dombraPluck: (context, destination) => playTone(context, destination, [146, 293, 440], 0.11, 'triangle', 0.06),
  woodPercussion: (context, destination) => {
    playNoise(context, destination, 0.16, 0.07, 700);
    playTone(context, destination, [164, 220, 294], 0.16, 'triangle', 0.045);
  },
  kazakhWin: (context, destination) => playSequence(context, destination, [293, 370, 440, 587, 740], 0.11, 'triangle'),
  kobyzResolve: (context, destination) => playSequence(context, destination, [220, 196, 164], 0.18, 'sine'),
  steppeNotice: (context, destination) => playTone(context, destination, [370, 555], 0.12, 'sine', 0.035),
  steppeStart: (context, destination) => {
    playNoise(context, destination, 0.55, 0.025, 420);
    playSequence(context, destination, [146, 220, 293], 0.2, 'triangle');
  },
};

function playSequence(context, destination, frequencies, stepDuration, type) {
  frequencies.forEach((frequency, index) => {
    playTone(
      context,
      destination,
      [frequency],
      stepDuration,
      type,
      0.05,
      context.currentTime + index * stepDuration * 0.75,
    );
  });
}

function playTone(
  context,
  destination,
  frequencies,
  duration,
  type,
  gainValue,
  startTime = context.currentTime,
) {
  frequencies.forEach((frequency, index) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const delay = index * 0.012;
    const start = startTime + delay;
    const end = start + duration;

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, start);
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(gainValue, start + masterFadeSeconds);
    gain.gain.exponentialRampToValueAtTime(0.0001, end);

    oscillator.connect(gain);
    gain.connect(destination);
    oscillator.start(start);
    oscillator.stop(end + 0.02);
  });
}

function playNoise(context, destination, duration, gainValue, filterFrequency) {
  const bufferSize = Math.floor(context.sampleRate * duration);
  const buffer = context.createBuffer(1, bufferSize, context.sampleRate);
  const data = buffer.getChannelData(0);

  for (let index = 0; index < bufferSize; index += 1) {
    data[index] = (Math.random() * 2 - 1) * (1 - index / bufferSize);
  }

  const source = context.createBufferSource();
  const filter = context.createBiquadFilter();
  const gain = context.createGain();
  const now = context.currentTime;

  filter.type = 'lowpass';
  filter.frequency.value = filterFrequency;
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(gainValue, now + masterFadeSeconds);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  source.buffer = buffer;
  source.connect(filter);
  filter.connect(gain);
  gain.connect(destination);
  source.start(now);
  source.stop(now + duration + 0.02);
}
