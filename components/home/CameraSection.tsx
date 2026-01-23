"use client";

import { motion } from "framer-motion";
import { Camera, Video, Aperture } from "lucide-react";

const cameras = [
  {
    name: "SONY FX3",
    desc: "Cinema Line",
    detail: "영화 제작용 시네마 카메라",
    icon: Camera,
  },
  {
    name: "SONY A7S3",
    desc: "Low Light Master",
    detail: "저조도 촬영 특화",
    icon: Video,
  },
  {
    name: "SONY A7M4",
    desc: "High Resolution",
    detail: "하이브리드 고해상도",
    icon: Aperture,
  },
];

export default function CameraSection() {
  return (
    <section className="py-20 md:py-28 px-4 bg-[#0a0a0a]">
      <div className="mx-auto max-w-4xl">
        {/* Section Title */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-4 text-center text-sm font-semibold tracking-[0.2em] text-accent uppercase"
        >
          Camera
        </motion.h2>

        {/* Main Description */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-center mb-14"
        >
          <p className="text-white/70 leading-relaxed text-base md:text-lg max-w-2xl mx-auto">
            저희는 저렴한 카메라로 카메라 갯수를 늘려 비싸게 받지 않습니다.
            <br className="hidden md:block" />
            모두 소니 브랜드의 카메라로 동일되어 있으며,
            <br className="hidden md:block" />
            <span className="text-white font-medium">FX3, A7S3, A7M4</span>와 같은 영상에 특화되어 있는 카메라를 사용하며,
            <br className="hidden md:block" />
            고용량 코덱을 사용합니다.
          </p>
        </motion.div>

        {/* Camera Cards */}
        <div className="grid md:grid-cols-3 gap-5 md:gap-6">
          {cameras.map((camera, index) => {
            const Icon = camera.icon;
            return (
              <motion.div
                key={camera.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
              >
                <div className="group bg-[#1a1a1a] rounded-xl p-8 border border-[#2a2a2a] text-center transition-all duration-300 hover:-translate-y-1 hover:border-accent hover:shadow-lg hover:shadow-accent/10">
                  {/* Icon */}
                  <div className="w-16 h-16 mx-auto mb-5 bg-accent/10 rounded-full flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                    <Icon className="w-7 h-7 text-accent" strokeWidth={1.5} />
                  </div>

                  {/* Camera Name */}
                  <h3 className="font-bold text-lg text-white mb-1 group-hover:text-accent transition-colors">
                    {camera.name}
                  </h3>

                  {/* English Subtitle */}
                  <p className="text-sm text-accent/80 mb-2">
                    {camera.desc}
                  </p>

                  {/* Detail */}
                  <p className="text-xs text-[#888888]">
                    {camera.detail}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Additional Note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center text-[#666666] text-sm mt-10"
        >
          SONY 정품 장비만을 사용합니다
        </motion.p>
      </div>
    </section>
  );
}
