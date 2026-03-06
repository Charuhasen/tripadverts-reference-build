import { CAMERA_WIDTH, CAMERA_HEIGHT } from "./constants";

export async function startCamera(): Promise<MediaStream> {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: {
      width: { ideal: CAMERA_WIDTH },
      height: { ideal: CAMERA_HEIGHT },
      facingMode: "user",
    },
    audio: false,
  });
  return stream;
}

export function stopCamera(stream: MediaStream): void {
  stream.getTracks().forEach((track) => track.stop());
}
