import type { FaceShape, SkinAnalysisResult, Recommendation } from '@/types';

const FACE_SHAPE_HAIRSTYLES: Record<FaceShape, Recommendation[]> = {
  oval: [
    {
      category: '发型',
      title: '百搭脸型 — 多数发型都适合',
      description: '鹅蛋脸是最均衡的脸型，几乎可以驾驭任何发型。推荐尝试中分长发、蓬松波浪卷或利落短发，都能完美展现面部比例。',
      icon: 'scissors',
    },
  ],
  round: [
    {
      category: '发型',
      title: '推荐偏分长发或层次感发型',
      description: '圆脸适合增加头顶蓬松感的发型来拉长面部线条。偏分长发、层次感中长发或高马尾都能有效修饰脸型，避免齐刘海。',
      icon: 'scissors',
    },
  ],
  square: [
    {
      category: '发型',
      title: '推荐柔和波浪卷或侧分刘海',
      description: '方脸适合用柔和的曲线来柔化下颌线条。大波浪卷发、侧分长刘海或空气刘海都能很好地修饰棱角，增加温柔感。',
      icon: 'scissors',
    },
  ],
  heart: [
    {
      category: '发型',
      title: '推荐齐下巴bob头或蓬松中长发',
      description: '心形脸适合增加下颌区域宽度的发型。齐下巴bob头、蓬松中长发或带刘海的发型可以平衡上宽下窄的比例。',
      icon: 'scissors',
    },
  ],
  long: [
    {
      category: '发型',
      title: '推荐蓬松短发或齐刘海',
      description: '长脸适合用刘海来缩短面部视觉长度。齐刘海、空气刘海搭配蓬松短发或中长发，能有效缩短脸型比例。',
      icon: 'scissors',
    },
  ],
  diamond: [
    {
      category: '发型',
      title: '推荐带刘海的中长发或波浪卷',
      description: '菱形脸适合用刘海修饰较窄的额头，同时用蓬松发型平衡颧骨宽度。侧分波浪卷或带刘海的中长发都是好选择。',
      icon: 'scissors',
    },
  ],
};

function getSkincareRecs(skin: SkinAnalysisResult): Recommendation[] {
  const recs: Recommendation[] = [];

  if (skin.evenness < 60) {
    recs.push({
      category: '护肤',
      title: '肤色不均 — 推荐使用美白精华',
      description: '肤色均匀度偏低，建议使用含烟酰胺(维生素B3)或维生素C的精华液，帮助提亮肤色、改善暗沉。日常注意防晒，使用SPF30以上防晒霜。',
      icon: 'sparkles',
    });
  }

  if (skin.redness > 35) {
    recs.push({
      category: '护肤',
      title: '泛红明显 — 推荐舒缓修护产品',
      description: '皮肤泛红指数偏高，可能存在敏感或炎症。建议使用含积雪草、芦荟或神经酰胺的舒缓产品，避免含酒精和香精的护肤品。',
      icon: 'sparkles',
    });
  }

  if (skin.spotsCount > 30) {
    recs.push({
      category: '护肤',
      title: '色斑可见 — 推荐淡斑精华+防晒',
      description: '检测到一定数量的色斑/暗沉区域。建议使用含传明酸、维生素C或视黄醇的淡斑产品，并坚持每日防晒以防止色斑加深。',
      icon: 'sparkles',
    });
  }

  if (skin.poreVisibility > 50) {
    recs.push({
      category: '护肤',
      title: '毛孔可见 — 推荐控油+收敛产品',
      description: '毛孔纹理较为明显，建议使用含水杨酸(BHA)的洁面产品和收敛水，定期做深层清洁。注意保湿平衡，避免过度清洁。',
      icon: 'sparkles',
    });
  }

  if (skin.brightness < 40) {
    recs.push({
      category: '护肤',
      title: '肤色偏暗 — 推荐提亮+去角质',
      description: '皮肤亮度偏低，建议每周1-2次温和去角质，使用含果酸(AHA)的产品促进细胞更新。搭配保湿面膜和提亮精华改善暗沉。',
      icon: 'sparkles',
    });
  }

  if (recs.length === 0) {
    recs.push({
      category: '护肤',
      title: '皮肤状态良好 — 维持日常护理',
      description: '皮肤各项指标均在健康范围内。建议继续保持日常清洁、保湿、防晒三步曲，定期补水即可。',
      icon: 'sparkles',
    });
  }

  return recs;
}

function getMakeupRecs(faceShape: FaceShape, skin: SkinAnalysisResult): Recommendation[] {
  const recs: Recommendation[] = [];

  const shapeMakeup: Record<FaceShape, string> = {
    oval: '鹅蛋脸几乎适合所有妆容风格。可以尝试自然裸妆突出好比例，或大胆尝试欧美妆感。',
    round: '圆脸建议用修容在脸颊两侧打阴影，视觉拉长脸型。高光打在鼻梁和额头中央增加立体感。',
    square: '方脸建议用修容柔化下颌角，在颧骨上方打高光转移视线焦点。眉毛画成柔和弧形避免棱角。',
    heart: '心形脸建议在下巴区域用修容增加宽度感，额头两侧轻扫阴影收窄。腮红打在颧骨偏下位置。',
    long: '长脸建议用横向腮红打法视觉缩短脸型，眉毛画平直眉避免高挑弧度。高光打在两侧颧骨。',
    diamond: '菱形脸建议在颧骨上方打高光、下方打修容柔和轮廓。额头和下巴用高光增加宽度感。',
  };

  recs.push({
    category: '妆容',
    title: '修容建议',
    description: shapeMakeup[faceShape],
    icon: 'palette',
  });

  if (skin.averageSkinTone) {
    const { r, g, b } = skin.averageSkinTone;
    let undertone = '中性色调';
    const warmScore = r - b;
    if (warmScore > 25) undertone = '暖色调';
    else if (warmScore < 10) undertone = '冷色调';

    recs.push({
      category: '妆容',
      title: `粉底推荐 — ${undertone}`,
      description: `根据肤色分析，您的肤色为${undertone}（RGB: ${r},${g},${b}）。${
        undertone === '暖色调'
          ? '推荐选择偏黄调的粉底，如象牙白、自然色。腮红选珊瑚色或蜜桃色。'
          : undertone === '冷色调'
          ? '推荐选择偏粉调的粉底，如瓷白色、玫瑰色。腮红选粉色或玫瑰色。'
          : '推荐选择中性色粉底，可灵活搭配冷暖色调彩妆。腮红选裸粉色。'
      }`,
      icon: 'palette',
    });
  }

  return recs;
}

export function getRecommendations(
  faceShape: FaceShape,
  skin: SkinAnalysisResult
): Recommendation[] {
  return [
    ...FACE_SHAPE_HAIRSTYLES[faceShape],
    ...getSkincareRecs(skin),
    ...getMakeupRecs(faceShape, skin),
  ];
}
