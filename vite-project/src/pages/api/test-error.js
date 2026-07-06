export default function handler(req, res) {
  // URL'den gelen errorCode parametresini alıyoruz
  const { errorCode } = req.query;

  if (errorCode) {
    // Eğer bir hata kodu gönderildiyse, network'e gerçekten 400 (Bad Request) hatası dönüyoruz
    return res.status(400).json({
      success: false,
      errorCode: errorCode,
    });
  }

  // Eğer kutu boş bırakıldıysa, 200 (Success) dönüyoruz
  return res.status(200).json({
    success: true,
  });
}
