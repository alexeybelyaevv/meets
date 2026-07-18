const testEventImages = [
  require("../../../../assets/images/event-pins/sunset-picnic.jpg"),
  require("../../../../assets/images/event-pins/coffee-chat.jpg"),
  require("../../../../assets/images/event-pins/gallery-walk.jpg"),
  require("../../../../assets/images/event-pins/rooftop-games.jpg"),
] as const;

export function getTestEventImage(index: number) {
  const safeIndex = Math.max(index, 0) % testEventImages.length;

  return testEventImages[safeIndex];
}
