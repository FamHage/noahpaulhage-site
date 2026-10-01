const touchMeSoundDescriptions = [
  "clock ticking", "soft cough", "crystalline sparkle", "paper crumpling", "delicate harp", "empty-room ambience", "soft gasp", "sewing machine", "distant bird", "chirping birds", "birds singing", "distant industrial machinery", "scissors cutting fabric", "silk and fabric rustling", "distant bell", "tiny glass chime", "porcelain clink", "loose beads moving", "fine jewelry chain moving", "footsteps in an old room", "old interior room tone", "soft wind", "water movement", "distant city and traffic ambience", "analog tape hiss", "film projector", "camera shutter", "paper page turning", "needle, thread, and fabric handling", "wooden drawer opening", "indistinct whisper-like ambience", "music-box note", "vibrating glass crystal", "old floorboard creak", "soft radio static interference", "isolated piano note", "subtle heartbeat pulse", "faint mechanical hum", "distant train", "tiny metallic charm movement", "breathing", "match strike", "delicate cloth snap and ribbon movement", "long ethereal ambient tail"
];

const touchMeItems = touchMeSoundDescriptions.map((description, index) => {
  const imageNumber = index + 1;
  const imageName = `touch me image (${imageNumber}).png`;
  return {
    id: imageNumber,
    image: `../images/touchme/${imageName}`,
    sound: `../audio/touchme/touch-sound-${String(imageNumber).padStart(2, "0")}.mp3`,
    description,
    alt: `Touch Me image ${imageNumber}`
  };
});
