const express = require("express")
const { 
    permintaanKirimToko,
    updatePemasanganPermintaanKirimToko, 
    getPemasanganPermintaanKirimTokoById,
    deletePemasanganPermintaanKirimToko,
    listStokKainPabrik,
    addPemasanganPermintaanKirimToko,
    requestListKonfirmasiPermintaanKirimToko,
    listDetailsKonfirmasiPermintaanKirimToko,
    saveKonfirmasiPermintaanKirimToko,
    updateKonfirmasiPermintaanKirimToko,
    pembatalanKonfirmasiPermintaanKirimToko
} = require("../controllers//permintaanKirimToko")
const router = express.Router()

router.get("/", permintaanKirimToko)
router.get("/list-pemasangan", getPemasanganPermintaanKirimTokoById)
router.get("/pemasangan/add", addPemasanganPermintaanKirimToko)
router.get("/pemasangan/update", updatePemasanganPermintaanKirimToko)
router.get("/pemasangan/delete", deletePemasanganPermintaanKirimToko)
router.get("/list-stok-pabrik", listStokKainPabrik)
router.get("/request-list-konfirmasi-permintaan-kirim", requestListKonfirmasiPermintaanKirimToko)
router.get("/list-details-konfirmasi-permintaan-kirim", listDetailsKonfirmasiPermintaanKirimToko)
router.post("/save-konfirmasi-permintaan-kirim", saveKonfirmasiPermintaanKirimToko)
router.get("/update-konfirmasi-permintaan-kirim", updateKonfirmasiPermintaanKirimToko)
router.get("/pembatalan-konfirmasi-permintaan-kirim", pembatalanKonfirmasiPermintaanKirimToko)

module.exports = router