import {
  IoMapOutline,
  IoChatboxEllipsesOutline,
  IoAddCircleOutline,
  IoMap,
  IoChatboxEllipses,
  IoAddCircle,
  IoFileTrayFull,
  IoFileTrayFullOutline,
} from "react-icons/io5";
import { LuBeeFill, LuBeeOutline } from "@/components/icons/LuBee";

export const navLinks = [
  { name: "Map", href: "/map", icon: IoMapOutline, iconFill: IoMap },
  { name: "Dashboard", href: "/dashboard", icon: IoFileTrayFullOutline, iconFill: IoFileTrayFull },
  { name: "Chat", href: "/chat", icon: IoChatboxEllipsesOutline, iconFill: IoChatboxEllipses },
  { name: "BuzzBot", href: "/chatbot", icon: LuBeeOutline, iconFill: LuBeeFill },
  { name: "Report Item", href: "/report-item", icon: IoAddCircleOutline, iconFill: IoAddCircle },
];
