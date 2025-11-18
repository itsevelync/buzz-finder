import {
  IoHomeOutline,
  IoMapOutline,
  IoChatboxEllipsesOutline,
  IoAddCircleOutline,
  IoHome,
  IoMap,
  IoChatboxEllipses,
  IoAddCircle,
} from "react-icons/io5";
import { BuzzBotIcon } from "@/components/icons/BuzzBotIcon";

export const navLinks = [
  { name: "Dashboard", href: "/dashboard", icon: IoHomeOutline, iconFill: IoHome },
  { name: "Map", href: "/map", icon: IoMapOutline, iconFill: IoMap },
  { name: "Chat", href: "/chat", icon: IoChatboxEllipsesOutline, iconFill: IoChatboxEllipses },
  { name: "BuzzBot", href: "/chatbot", icon: BuzzBotIcon, iconFill: BuzzBotIcon },
  { name: "Report Item", href: "/report-item", icon: IoAddCircleOutline, iconFill: IoAddCircle },
];
