export const navigation = [
  { label: "首頁", href: "/" },
  {
    label: "商業攝影服務",
    children: [
      { label: "商業攝影總覽", href: "/services/commercial-photography/" },
      { label: "飯店・民宿・露營區攝影", href: "/services/hotel-photography/" },
      { label: "活動會議攝影", href: "/services/event-photography/" },
      { label: "旅遊業宣傳攝影", href: "/services/travel-promotion-photography/" },
      { label: "餐飲業廣告・微電影", href: "/services/food-commercial-video/" },
      { label: "空拍攝影", href: "/services/aerial-photography/" }
    ]
  },
  { label: "作品案例", href: "/works/" },
  { label: "攝影團隊", href: "/about/" },
  { label: "客戶專區", href: "/clients/" },
  { label: "商業攝影文章", href: "/articles/" },
  { label: "聯絡詢價", href: "/contact/", cta: true }
];
