"use client";

import { useState, useEffect } from "react";

const GAS_URL = "https://script.google.com/macros/s/AKfycbznw0NudMiza9wFV9QwcXp6o6UK9qxdIyq1M1ANxupwkPB3AH9nnqieqBzQXquylbsuJw/exec";
const SECRET_KEY = "aubfilm-2025-!AbC9";

interface CustomFormData {
  weddingDate: string;
  weddingTime: string;
  venue: string;
  groomName: string;
  brideName: string;
  style: string[];
  editStyle: string[];
  music: string[];
  length: string[];
  effect: string[];
  content: string[];
  specialRequest: string;
}

interface CheckboxGroup {
  name: string;
  label: string;
  options: { id: string; value: string; label: string; defaultChecked?: boolean }[];
}

interface CustomShootingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: {
    weddingDate?: string;
    weddingTime?: string;
    venue?: string;
    groomName?: string;
    brideName?: string;
  };
}

export default function CustomShootingModal({ isOpen, onClose, initialData }: CustomShootingModalProps) {
  const [formData, setFormData] = useState<CustomFormData>({
    weddingDate: initialData?.weddingDate || "",
    weddingTime: initialData?.weddingTime || "",
    venue: initialData?.venue || "",
    groomName: initialData?.groomName || "",
    brideName: initialData?.brideName || "",
    style: ["시네마틱"],
    editStyle: ["영화 같은 편집"],
    music: ["팝"],
    length: ["하이라이트 (3-5분)"],
    effect: [],
    content: [],
    specialRequest: "",
  });

  const [selectedCheckboxes, setSelectedCheckboxes] = useState<Record<string, string>>({
    style: "style2",
    editStyle: "edit7",
    music: "music2",
    length: "length2",
  });

  const [multiSelectGroups, setMultiSelectGroups] = useState<Record<string, string[]>>({
    effect: [],
    content: [],
  });

  const [showResult, setShowResult] = useState(false);
  const [resultData, setResultData] = useState<CustomFormData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // initialData가 변경되면 formData 업데이트
  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({
        ...prev,
        weddingDate: initialData.weddingDate || prev.weddingDate,
        weddingTime: initialData.weddingTime || prev.weddingTime,
        venue: initialData.venue || prev.venue,
        groomName: initialData.groomName || prev.groomName,
        brideName: initialData.brideName || prev.brideName,
      }));
    }
  }, [initialData]);

  const checkboxGroups: CheckboxGroup[] = [
    {
      name: "style",
      label: "🎬 영상 스타일",
      options: [
        { id: "style2", value: "시네마틱", label: "시네마틱", defaultChecked: true },
        { id: "style3", value: "다큐멘터리", label: "다큐멘터리" },
      ],
    },
    {
      name: "editStyle",
      label: "✂️ 편집 스타일",
      options: [
        { id: "edit1", value: "빠른 컷 편집", label: "빠른 템포의 컷 편집" },
        { id: "edit2", value: "부드러운 전환", label: "느린 템포의 컷 편집" },
        { id: "edit7", value: "영화 같은 편집", label: "영화 같은 편집", defaultChecked: true },
      ],
    },
    {
      name: "music",
      label: "🎵 음악 장르",
      options: [
        { id: "music1", value: "클래식", label: "클래식" },
        { id: "music2", value: "팝", label: "팝", defaultChecked: true },
        { id: "music3", value: "발라드", label: "J-pop" },
        { id: "music4", value: "재즈", label: "재즈" },
        { id: "music5", value: "인디", label: "인디" },
        { id: "music6", value: "K-pop", label: "K-pop" },
        { id: "music7", value: "영화 OST", label: "영화 OST" },
        { id: "music8", value: "직접 선곡", label: "직접 선곡" },
      ],
    },
    {
      name: "length",
      label: "⏱️ 영상 진행형식",
      options: [
        { id: "length2", value: "하이라이트 (3-5분)", label: "뮤직비디오 (2-3분)", defaultChecked: true },
        { id: "length3", value: "예능형 (10-15분)", label: "예능형 (10-15분)(추가비용 발생)" },
        { id: "length4", value: "다큐멘터리(20-30분)", label: "다큐멘터리(15-30분)" },
      ],
    },
    {
      name: "effect",
      label: "✨ 추가효과",
      options: [
        { id: "effect2", value: "타임랩스", label: "적절한 슬로우 모션" },
        { id: "effect5", value: "자막/나레이션", label: "자막/나레이션(다큐멘터리 추천)" },
        { id: "effect6", value: "인터뷰 삽입", label: "인터뷰 삽입" },
      ],
    },
    {
      name: "content",
      label: "📱 추가 옵션 (추가비용 발생)",
      options: [
        { id: "content1", value: "드론 촬영", label: "드론 촬영 (촬영 여건에 따라 불가할 수 있습니다.)" },
        { id: "content2", value: "수석 촬영자 추가", label: "수석 촬영자 추가(25만원)" },
      ],
    },
  ];

  const handleCheckboxToggle = (groupName: string, optionId: string, value: string) => {
    if (groupName === "effect" || groupName === "content") {
      setMultiSelectGroups((prev) => {
        const current = prev[groupName] || [];
        const isSelected = current.includes(value);
        const newValues = isSelected
          ? current.filter((v) => v !== value)
          : [...current, value];
        
        setFormData((prevData) => ({
          ...prevData,
          [groupName]: newValues,
        }));

        return {
          ...prev,
          [groupName]: newValues,
        };
      });
    } else {
      setSelectedCheckboxes((prev) => ({
        ...prev,
        [groupName]: optionId,
      }));

      setFormData((prev) => ({
        ...prev,
        [groupName]: [value],
      }));
    }
  };

  const handleInputChange = (field: keyof CustomFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.weddingDate || !formData.groomName || !formData.brideName) {
      alert("날짜와 신랑/신부명을 입력해주세요.");
      return;
    }

    setIsSubmitting(true);

    const payload = {
      weddingDate: formData.weddingDate,
      weddingTime: formData.weddingTime,
      venue: formData.venue,
      groomName: formData.groomName,
      brideName: formData.brideName,
      style: formData.style[0] || "",
      editStyles: formData.editStyle,
      musics: formData.music,
      lengths: formData.length,
      effects: formData.effect,
      contents: formData.content,
      specialRequest: formData.specialRequest,
      secret: SECRET_KEY,
    };

    try {
      const res = await fetch(GAS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json().catch(() => ({ ok: false }));

      if (res.ok && json.ok) {
        setResultData(formData);
        setShowResult(true);
      } else {
        throw new Error(json.error || "전송 실패");
      }
    } catch (err) {
      console.warn("fetch failed, fallback to iframe submit", err);
      try {
        const iframe = document.createElement("iframe");
        iframe.name = "hidden_iframe_raub";
        iframe.style.display = "none";
        document.body.appendChild(iframe);

        const hiddenForm = document.createElement("form");
        hiddenForm.method = "POST";
        hiddenForm.action = GAS_URL;
        hiddenForm.target = "hidden_iframe_raub";
        hiddenForm.style.display = "none";

        Object.keys(payload).forEach((key) => {
          const value = payload[key as keyof typeof payload];
          if (Array.isArray(value)) {
            value.forEach((v) => {
              const inp = document.createElement("input");
              inp.type = "hidden";
              inp.name = key;
              inp.value = v;
              hiddenForm.appendChild(inp);
            });
          } else {
            const inp = document.createElement("input");
            inp.type = "hidden";
            inp.name = key;
            inp.value = String(value);
            hiddenForm.appendChild(inp);
          }
        });

        document.body.appendChild(hiddenForm);
        hiddenForm.submit();

        setResultData(formData);
        setShowResult(true);

        setTimeout(() => {
          try {
            document.body.removeChild(hiddenForm);
          } catch (e) {}
          try {
            document.body.removeChild(iframe);
          } catch (e) {}
        }, 1500);
      } catch (err2) {
        alert("전송에 실패했습니다. 잠시 후 다시 시도해주세요.");
        console.error("fallback failed", err2);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      weddingDate: initialData?.weddingDate || "",
      weddingTime: initialData?.weddingTime || "",
      venue: initialData?.venue || "",
      groomName: initialData?.groomName || "",
      brideName: initialData?.brideName || "",
      style: ["시네마틱"],
      editStyle: ["영화 같은 편집"],
      music: ["팝"],
      length: ["하이라이트 (3-5분)"],
      effect: [],
      content: [],
      specialRequest: "",
    });
    setSelectedCheckboxes({
      style: "style2",
      editStyle: "edit7",
      music: "music2",
      length: "length2",
    });
    setMultiSelectGroups({
      effect: [],
      content: [],
    });
    setShowResult(false);
    setResultData(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 overflow-y-auto">
      <div className="bg-[#0a0a0a] text-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto my-8">
        <div className="sticky top-0 bg-[#0a0a0a] border-b border-[#2a2a2a] px-6 py-4 flex justify-between items-center z-10">
          <h2 className="text-2xl font-bold">본식DVD 커스텀 신청서</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-[#ff4757] transition-colors text-2xl"
          >
            ×
          </button>
        </div>

        <div className="p-6">
          {showResult && resultData ? (
            <div>
              <div className="text-center py-10 px-5 bg-gradient-to-r from-[#ff4757] to-[#ff6b81] rounded-2xl mb-10">
                <h2 className="text-3xl font-bold mb-2">✨ 신청이 완료되었습니다!</h2>
                <p className="opacity-90 text-sm">선택하신 커스텀 옵션을 확인해주세요</p>
              </div>

              <div className="space-y-5 mb-6">
                <div className="bg-[#252525] p-6 rounded-xl border-l-4 border-[#ff4757]">
                  <h4 className="text-[#ff4757] text-base font-bold mb-4">📅 예식 정보</h4>
                  <div className="text-[#ddd] space-y-2 text-sm leading-relaxed">
                    <p><strong>날짜:</strong> {resultData.weddingDate}</p>
                    <p><strong>시간:</strong> {resultData.weddingTime}</p>
                    <p><strong>장소:</strong> {resultData.venue}</p>
                    <p><strong>신랑:</strong> {resultData.groomName} <strong>신부:</strong> {resultData.brideName}</p>
                  </div>
                </div>

                {resultData.style.length > 0 && (
                  <div className="bg-[#252525] p-6 rounded-xl border-l-4 border-[#ff4757]">
                    <h4 className="text-[#ff4757] text-base font-bold mb-4">🎬 영상 스타일</h4>
                    <div>
                      {resultData.style.map((item) => (
                        <span
                          key={item}
                          className="inline-block bg-[rgba(255,71,87,0.2)] text-[#ff4757] px-4 py-2 rounded-full mx-1 my-1 text-xs font-semibold border border-[rgba(255,71,87,0.3)]"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {resultData.editStyle.length > 0 && (
                  <div className="bg-[#252525] p-6 rounded-xl border-l-4 border-[#ff4757]">
                    <h4 className="text-[#ff4757] text-base font-bold mb-4">✂️ 편집 스타일</h4>
                    <div>
                      {resultData.editStyle.map((item) => (
                        <span
                          key={item}
                          className="inline-block bg-[rgba(255,71,87,0.2)] text-[#ff4757] px-4 py-2 rounded-full mx-1 my-1 text-xs font-semibold border border-[rgba(255,71,87,0.3)]"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {resultData.music.length > 0 && (
                  <div className="bg-[#252525] p-6 rounded-xl border-l-4 border-[#ff4757]">
                    <h4 className="text-[#ff4757] text-base font-bold mb-4">🎵 음악 장르</h4>
                    <div>
                      {resultData.music.map((item) => (
                        <span
                          key={item}
                          className="inline-block bg-[rgba(255,71,87,0.2)] text-[#ff4757] px-4 py-2 rounded-full mx-1 my-1 text-xs font-semibold border border-[rgba(255,71,87,0.3)]"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {resultData.length.length > 0 && (
                  <div className="bg-[#252525] p-6 rounded-xl border-l-4 border-[#ff4757]">
                    <h4 className="text-[#ff4757] text-base font-bold mb-4">⏱️ 영상 진행형식</h4>
                    <div>
                      {resultData.length.map((item) => (
                        <span
                          key={item}
                          className="inline-block bg-[rgba(255,71,87,0.2)] text-[#ff4757] px-4 py-2 rounded-full mx-1 my-1 text-xs font-semibold border border-[rgba(255,71,87,0.3)]"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {resultData.effect.length > 0 && (
                  <div className="bg-[#252525] p-6 rounded-xl border-l-4 border-[#ff4757]">
                    <h4 className="text-[#ff4757] text-base font-bold mb-4">✨ 추가효과</h4>
                    <div>
                      {resultData.effect.map((item) => (
                        <span
                          key={item}
                          className="inline-block bg-[rgba(255,71,87,0.2)] text-[#ff4757] px-4 py-2 rounded-full mx-1 my-1 text-xs font-semibold border border-[rgba(255,71,87,0.3)]"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {resultData.content.length > 0 && (
                  <div className="bg-[#252525] p-6 rounded-xl border-l-4 border-[#ff4757]">
                    <h4 className="text-[#ff4757] text-base font-bold mb-4">📱 추가 옵션</h4>
                    <div>
                      {resultData.content.map((item) => (
                        <span
                          key={item}
                          className="inline-block bg-[rgba(255,71,87,0.2)] text-[#ff4757] px-4 py-2 rounded-full mx-1 my-1 text-xs font-semibold border border-[rgba(255,71,87,0.3)]"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {resultData.specialRequest && (
                  <div className="bg-[#252525] p-6 rounded-xl border-l-4 border-[#ff4757]">
                    <h4 className="text-[#ff4757] text-base font-bold mb-4">💝 특별 요청사항</h4>
                    <div className="text-[#ddd] text-sm leading-relaxed whitespace-pre-wrap">
                      {resultData.specialRequest}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={resetForm}
                  className="flex-1 py-4 bg-transparent text-[#ff4757] border-2 border-[#ff4757] rounded-xl text-base font-bold cursor-pointer transition-all hover:bg-[#ff4757] hover:text-white"
                >
                  다시 작성하기
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-4 bg-gradient-to-r from-[#ff4757] to-[#ff6b81] text-white border-none rounded-xl text-base font-bold cursor-pointer transition-all"
                >
                  닫기
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-[rgba(255,71,87,0.1)] border-l-4 border-[#ff4757] p-5 rounded-lg mb-6">
                <p className="text-[#ddd] text-sm leading-relaxed">
                  ✅<b>대표지정 or 대표배정 촬영만 해당 됩니다.</b>
                  <br />
                  ✅<b>계약을 완료한 후 카카오톡 채널을 통해 커스텀 신청 부탁드립니다.</b>
                  <br />
                  ✅여건에 따라 불가한 옵션이 있을 수 있습니다.
                  <br />
                  🚨<b>카카오톡 채널로 말씀없이 작성하시면 적용되지 않습니다!!</b>
                </p>
              </div>

              <div>
                <div className="flex items-center mb-5">
                  <div className="text-lg font-bold text-white">📅 예식 정보</div>
                  <span className="bg-[#ff4757] text-white text-xs px-3 py-1 rounded-full ml-3 font-semibold">
                    필수
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <input
                    type="date"
                    required
                    value={formData.weddingDate}
                    onChange={(e) => handleInputChange("weddingDate", e.target.value)}
                    className="w-full px-4 py-4 bg-[#252525] border-2 border-[#2a2a2a] rounded-lg text-base text-white transition-all focus:outline-none focus:border-[#ff4757] focus:bg-[#2a2a2a]"
                    style={{ colorScheme: "dark" }}
                    onKeyDown={(e) => e.preventDefault()}
                  />
                  <input
                    type="time"
                    required
                    value={formData.weddingTime}
                    onChange={(e) => handleInputChange("weddingTime", e.target.value)}
                    className="w-full px-4 py-4 bg-[#252525] border-2 border-[#2a2a2a] rounded-lg text-base text-white transition-all focus:outline-none focus:border-[#ff4757] focus:bg-[#2a2a2a]"
                    style={{ colorScheme: "dark" }}
                    onKeyDown={(e) => e.preventDefault()}
                  />
                </div>
                <input
                  type="text"
                  placeholder="예식 장소를 입력해주세요"
                  required
                  value={formData.venue}
                  onChange={(e) => handleInputChange("venue", e.target.value)}
                  className="w-full px-4 py-4 bg-[#252525] border-2 border-[#2a2a2a] rounded-lg text-base text-white mb-3 transition-all focus:outline-none focus:border-[#ff4757] focus:bg-[#2a2a2a]"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="신랑 성함"
                    required
                    value={formData.groomName}
                    onChange={(e) => handleInputChange("groomName", e.target.value)}
                    className="w-full px-4 py-4 bg-[#252525] border-2 border-[#2a2a2a] rounded-lg text-base text-white transition-all focus:outline-none focus:border-[#ff4757] focus:bg-[#2a2a2a]"
                  />
                  <input
                    type="text"
                    placeholder="신부 성함"
                    required
                    value={formData.brideName}
                    onChange={(e) => handleInputChange("brideName", e.target.value)}
                    className="w-full px-4 py-4 bg-[#252525] border-2 border-[#2a2a2a] rounded-lg text-base text-white transition-all focus:outline-none focus:border-[#ff4757] focus:bg-[#2a2a2a]"
                  />
                </div>
              </div>

              {checkboxGroups.map((group) => (
                <div key={group.name}>
                  <div className="flex items-center mb-5">
                    <div className="text-lg font-bold text-white">{group.label}</div>
                    {group.name !== "effect" && group.name !== "content" && (
                      <span className="bg-[#ff4757] text-white text-xs px-3 py-1 rounded-full ml-3 font-semibold">
                        필수
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {group.options.map((option) => {
                      const isMultiSelect = group.name === "effect" || group.name === "content";
                      const isChecked = isMultiSelect
                        ? multiSelectGroups[group.name]?.includes(option.value) || false
                        : selectedCheckboxes[group.name] === option.id;
                      
                      return (
                        <div
                          key={option.id}
                          onClick={() => handleCheckboxToggle(group.name, option.id, option.value)}
                          className={`bg-[#252525] border-2 rounded-lg px-4 py-4 cursor-pointer transition-all flex items-center ${
                            isChecked
                              ? "border-[#ff4757] bg-[rgba(255,71,87,0.1)]"
                              : "border-[#2a2a2a] hover:border-[#ff4757] hover:bg-[#2a2a2a]"
                          }`}
                        >
                          <input
                            type="checkbox"
                            id={option.id}
                            name={group.name}
                            value={option.value}
                            checked={isChecked}
                            onChange={() => {}}
                            className="w-5 h-5 mr-3 cursor-pointer accent-[#ff4757]"
                          />
                          <label
                            htmlFor={option.id}
                            className={`cursor-pointer text-sm flex-1 ${
                              isChecked ? "text-[#ff4757] font-semibold" : "text-[#ddd]"
                            }`}
                          >
                            {option.label}
                          </label>
                          {isChecked && (
                            <span className="text-[#ff4757] text-lg ml-auto">✓</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              <div>
                <div className="flex items-center mb-5">
                  <div className="text-lg font-bold text-white">💝 특별 요청사항</div>
                </div>
                <textarea
                  placeholder="특별히 담고 싶은 순간이나 요청사항을 자유롭게 작성해주세요."
                  value={formData.specialRequest}
                  onChange={(e) => handleInputChange("specialRequest", e.target.value)}
                  rows={6}
                  className="w-full px-4 py-4 bg-[#252525] border-2 border-[#2a2a2a] rounded-lg text-base text-white min-h-[120px] resize-y transition-all focus:outline-none focus:border-[#ff4757] focus:bg-[#2a2a2a] leading-relaxed"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-4 bg-transparent text-white border-2 border-[#2a2a2a] rounded-xl text-base font-bold cursor-pointer transition-all hover:border-[#ff4757]"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-4 bg-gradient-to-r from-[#ff4757] to-[#ff6b81] text-white border-none rounded-xl text-lg font-bold cursor-pointer transition-all hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(255,71,87,0.4)] active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "전송중..." : "커스텀 신청하기"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
