import { createSound } from 'react-native-nitro-sound';

let sound: ReturnType<typeof createSound> | undefined;
let state = { uri: '', playing: false, paused: false, position: 0, duration: 0, busy: false };
const listeners = new Set<() => void>();
let queue = Promise.resolve();
function update(next: Partial<typeof state>) {
  state = { ...state, ...next };
  listeners.forEach(listener => listener());
}
function player() {
  if (!sound) {
    sound = createSound();
    sound.setSubscriptionDuration(0.25);
    sound.addPlayBackListener(event => update({ position: event.currentPosition, duration: event.duration }));
    sound.addPlaybackEndListener(() => update({ playing: false, paused: false, position: 0 }));
  }
  return sound;
}
function serial(action: () => Promise<void>): Promise<void> {
  const result = queue.then(action);
  queue = result.catch(() => {});
  return result;
}
export const audioPlaybackSnapshot = () => state;
export const subscribeAudioPlayback = (listener: () => void) => {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
};
export function toggleAudioPlayback(uri: string): Promise<void> {
  return serial(async () => {
    update({ busy: true });
    try {
      const instance = player();
      if (state.uri === uri && state.playing) {
        await instance.pausePlayer();
        update({ playing: false, paused: true });
      } else if (state.uri === uri && state.paused) {
        await instance.resumePlayer();
        update({ playing: true, paused: false });
      } else {
        if (state.uri) await instance.stopPlayer();
        update({ uri, position: 0, duration: 0, playing: false, paused: false });
        await instance.startPlayer(uri);
        update({ playing: true });
      }
    } catch (error) {
      await sound?.stopPlayer().catch(() => {});
      update({ uri: '', playing: false, paused: false, position: 0 });
      throw error;
    } finally { update({ busy: false }); }
  });
}
export function stopAudioPlayback(uri?: string): Promise<void> {
  return serial(async () => {
    if (uri && state.uri !== uri) return;
    try { if (sound && state.uri) await sound.stopPlayer(); }
    finally { update({ uri: '', playing: false, paused: false, position: 0, duration: 0 }); }
  });
}
