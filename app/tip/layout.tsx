import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "본식영상 활용 팁 | 라우브필름",
  description: "본식영상을 최고의 방법으로 시청하고 활용하는 팁을 안내합니다. 영상 시청 방법, USB 활용, 화질 손실 없이 저장하기, 커스텀 방법 등.",
  openGraph: {
    title: "본식영상 활용 팁 | 라우브필름",
    description: "본식영상을 최고의 방법으로 시청하고 활용하는 팁을 안내합니다.",
  },
};

export default function TipLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
