import { type ComponentType, type SVGProps } from "react";
import {
  PencilSquareIcon,
  BoltIcon,
  BookOpenIcon,
  CodeBracketIcon,
  MusicalNoteIcon,
  PaintBrushIcon,
  HeartIcon,
  FireIcon,
  StarIcon,
  SparklesIcon,
  SunIcon,
  MoonIcon,
  AcademicCapIcon,
  BeakerIcon,
  CameraIcon,
  ChatBubbleLeftIcon,
  ClockIcon,
  CubeIcon,
  GlobeAltIcon,
  LightBulbIcon,
  MicrophoneIcon,
  PuzzlePieceIcon,
  RocketLaunchIcon,
  TrophyIcon,
  CheckCircleIcon,
  HandThumbUpIcon,
  WrenchScrewdriverIcon,
  DocumentTextIcon,
  FilmIcon,
  HomeIcon,
} from "@heroicons/react/24/solid";

export type IconName = keyof typeof ICON_MAP;

export const ICON_MAP: Record<
  string,
  ComponentType<SVGProps<SVGSVGElement>>
> = {
  pencil: PencilSquareIcon,
  bolt: BoltIcon,
  book: BookOpenIcon,
  code: CodeBracketIcon,
  music: MusicalNoteIcon,
  paint: PaintBrushIcon,
  heart: HeartIcon,
  fire: FireIcon,
  star: StarIcon,
  sparkles: SparklesIcon,
  sun: SunIcon,
  moon: MoonIcon,
  academic: AcademicCapIcon,
  beaker: BeakerIcon,
  camera: CameraIcon,
  chat: ChatBubbleLeftIcon,
  clock: ClockIcon,
  cube: CubeIcon,
  globe: GlobeAltIcon,
  lightbulb: LightBulbIcon,
  microphone: MicrophoneIcon,
  puzzle: PuzzlePieceIcon,
  rocket: RocketLaunchIcon,
  trophy: TrophyIcon,
  check: CheckCircleIcon,
  thumbup: HandThumbUpIcon,
  wrench: WrenchScrewdriverIcon,
  document: DocumentTextIcon,
  film: FilmIcon,
  home: HomeIcon,
};

export const ICON_KEYS = Object.keys(ICON_MAP);

export function HabitIcon({
  icon,
  className,
  style,
}: {
  icon: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const Comp = ICON_MAP[icon];
  if (!Comp) return <span className={className}>{icon}</span>;
  return <Comp className={className} style={style} />;
}
