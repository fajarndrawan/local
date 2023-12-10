const axios = require('axios');
const { checkCurrentAuthorization } = require('../helpers/globalFunction');
const { 
  db_accounting_and_factory,
  db_accounting_and_factory_connnection
 } = require('../config/masterDatabase');
const { PENJUALAN } = require('../helpers/constant');

const permintaanKirimToko = async (req, res) => {
  let currentUser = 0;
  let branch = req.query.cabang;
  let tanggal = req.query.tanggal;
  let user_id = 0;
  let listPemasangan = [];
  let permintaanKirimQty = 0;

  try {    
    if (!branch) throw new TypeError('cabang tidak boleh kosong!');
    if (!tanggal) throw new TypeError('tanggal tidak boleh kosong!');

    // const requestData = await axios.get('http://192.168.20.20:8079/reordering/lppermintaankirim', 
    //   { data: {cabang: branch, tanggal: tanggal} 
    // });
    // const resultRequestData = requestData.data;
    const resultRequestData = [
      {
        "nama_kain": "COMBED 30S",
        "jenis_warna": "HITAM REAKTIF",
        "tanggal": "2023-11-06T00:00:00.000Z",
        "total_permintaan_import": 3,
        "user_id": 0,
        "cabang": "holis"
      },
      {
        "nama_kain": "COMBED 16S",
        "jenis_warna": "MAROON",
        "tanggal": "2023-11-06T00:00:00.000Z",
        "total_permintaan_import": 1,
        "user_id": 0,
        "cabang": "holis"
      }
    ];
    
    const conn = await db_accounting_and_factory_connnection;
     
    for (const item of resultRequestData) {
      let query = `
        INSERT INTO 
        f_tbl_permintaan_kirim_toko 
        (nama_kain, jenis_warna, tanggal, total_permintaan_import, tanggal_input, user_id, cabang) 
        VALUES ('` + item.nama_kain + `', '` + item.jenis_warna + `', '` + item.tanggal + `', ` + item.total_permintaan_import + `, NOW(), ` + user_id + `, '` + branch + `')
        ON DUPLICATE KEY UPDATE total_permintaan_import = ` + item.total_permintaan_import;
      await conn.execute(query);

      permintaanKirimQty = parseInt(item.total_permintaan_import);

      if (item.total_permintaan_import > 0) {
        let queryStokPabrik = `
          SELECT s.no_kp no_data, s.no_po_toko, s.jenis_kain nama_kain_pabrik, s.nama_kain_toko, s.nama_warna nama_warna_pabrik, s.nama_warna_toko,
          pm.tanggal_terima, s.tanggal_jam tgl_update_stok, s.jumlah_stok_siap_kirim,
          IFNULL((SELECT SUM(a2.jml_roll) FROM tbl_sj_matang a1 JOIN tbl_sj_matang_det a2 ON (a1.id_sj=a2.id_sj)
          WHERE a1.status=2 AND a2.no_kp=s.no_kp AND a1.tanggal>DATE(NOW())), 0) jml_kirim,
          pm.lebar, pm.gramasi, pm.keterangan,
          IFNULL((SELECT SUM(quantity) FROM f_relasi_no_data_permintaan_kirim_toko a WHERE a.no_data = s.no_kp), 0) AS quantity_pemasangan,
          IFNULL(s.jumlah_stok_siap_kirim - IF((SELECT quantity_pemasangan) >= (SELECT jml_kirim), (SELECT quantity_pemasangan), (SELECT jml_kirim)), 0) AS quantity_sisa
          FROM tbl_stok_kain_matang_siap_kirim s
          JOIN tbl_penerimaan_kainmatang pm ON (pm.no_sj_matang=s.no_kp)
          WHERE s.jenis_po='STOK' AND s.status_data='DATA'
          AND s.jumlah_stok_siap_kirim>0 AND s.nama_kain_toko = '` + item.nama_kain + `' AND s.nama_warna_toko = '` + item.jenis_warna + `'
          ORDER BY pm.tanggal_terima ASC`;
        const [rows, fields] = await conn.execute(queryStokPabrik);
        let resultStokPabrik = rows;
        
        if (resultStokPabrik.length > 0) {            
          for (const listData of resultStokPabrik) {                  
            let queryPermintaanKirimToko = `SELECT * FROM f_tbl_permintaan_kirim_toko WHERE tanggal LIKE '%` + tanggal + `%' AND cabang = '` + branch + `' AND nama_kain = '` + listData.nama_kain_toko + `'`;
            const [rows, fields] = await conn.execute(queryPermintaanKirimToko);
            let selectedDataId = rows[0].id;
            if (permintaanKirimQty > 0) {
              let quantitySisa = parseInt(listData.quantity_sisa);
              if (quantitySisa > 0) {
                if (quantitySisa <= permintaanKirimQty) {
                  listPemasangan.push({
                    id_f_tbl_permintaan_kirim_toko: selectedDataId,
                    no_data: listData.no_data,
                    permintaan_kirim: quantitySisa
                  });
                  
                  permintaanKirimQty = permintaanKirimQty - quantitySisa;
                }        
                if (permintaanKirimQty > 0) {
                  if (quantitySisa > permintaanKirimQty) {
                    listPemasangan.push({
                      id_f_tbl_permintaan_kirim_toko: selectedDataId,
                      no_data: listData.no_data,
                      permintaan_kirim: permintaanKirimQty
                    });
    
                    permintaanKirimQty = 0;
                  }    
                }
              }    
            }
          };
        }
      }
    };

    if (listPemasangan.length > 0) {
      listPemasangan.map(async (item, key) => {
        let querySavePermintaanKirimToko = `
          INSERT INTO 
          f_relasi_no_data_permintaan_kirim_toko
          (id_f_tbl_permintaan_kirim_toko, no_data, quantity, tanggal_input, user_id) 
          VALUES (` + item.id_f_tbl_permintaan_kirim_toko + `, '` + item.no_data + `', ` + item.permintaan_kirim + `, ` + ` NOW() ` + `, ` + user_id + `)
          ON DUPLICATE KEY UPDATE quantity = ` + item.permintaan_kirim;
        await conn.execute(querySavePermintaanKirimToko);
      });
    }
    let queryResult = `SELECT * FROM f_tbl_permintaan_kirim_toko WHERE tanggal LIKE '%` + tanggal + `%' AND cabang = '` + branch + `'`;
    const [rows, fields] = await conn.execute(queryResult);
    
    return res.status(200).send({
      meta: {
        message: "Success",
        code: res.statusCode,
        success: true,
      }, data: rows
    })
  } catch (error) {
    return res.status(400).send({
      meta: {
        message: error.message,
        code: res.statusCode,
        success: false,
      },
    })
  }
}

const getPemasanganPermintaanKirimTokoById = async (req, res) => {
  let id_f_tbl_permintaan_kirim_toko = parseInt(req.query.idPermintaanKirimToko);
  let query;
  let process;
  let currentData;

  try {
    if (Number.isNaN(id_f_tbl_permintaan_kirim_toko)) throw new TypeError('Id harus berupa angka.');

    query = `
      SELECT pt.id, pt.id_f_tbl_permintaan_kirim_toko, pt.user_id, pt.status, pt.quantity, s.no_kp no_data, s.no_po_toko, s.jenis_kain nama_kain_pabrik, s.nama_kain_toko, s.nama_warna nama_warna_pabrik, s.nama_warna_toko,
      pm.tanggal_terima, s.tanggal_jam tgl_update_stok, s.jumlah_stok_siap_kirim,
      IFNULL((SELECT SUM(a2.jml_roll) FROM tbl_sj_matang a1 JOIN tbl_sj_matang_det a2 ON (a1.id_sj=a2.id_sj)
      WHERE a1.status=2 AND a2.no_kp=s.no_kp AND a1.tanggal>DATE(NOW())), 0) jml_kirim,
      pm.lebar, pm.gramasi, pm.keterangan,
      IFNULL((SELECT SUM(quantity) FROM f_relasi_no_data_permintaan_kirim_toko a WHERE a.no_data = s.no_kp), 0) AS quantity_pemasangan,
      IFNULL(s.jumlah_stok_siap_kirim - IF((SELECT quantity_pemasangan) >= (SELECT jml_kirim), (SELECT quantity_pemasangan), (SELECT jml_kirim)), 0) AS quantity_sisa
      FROM tbl_stok_kain_matang_siap_kirim s
      JOIN tbl_penerimaan_kainmatang pm ON (pm.no_sj_matang=s.no_kp)
      JOIN f_relasi_no_data_permintaan_kirim_toko pt ON (pt.no_data=s.no_kp)
      WHERE s.jenis_po='STOK' AND s.status_data='DATA'
      AND s.jumlah_stok_siap_kirim>0 AND pt.id_f_tbl_permintaan_kirim_toko = ` + id_f_tbl_permintaan_kirim_toko + ` AND pt.status = 0
      ORDER BY pm.tanggal_terima ASC`;
    // query = `SELECT * FROM f_relasi_no_data_permintaan_kirim_toko WHERE id_f_tbl_permintaan_kirim_toko = ` + id_f_tbl_permintaan_kirim_toko + ` AND status = 0`;
    process = await db_accounting_and_factory.query(query, function (err, result){
      if (err) throw err;
    });
    currentData = process[0]

    return res.status(200).send({
      meta: {
        message: "Success",
        code: res.statusCode,
        success: true,
      }, data: currentData
    })
  } catch (error) {
    return res.status(400).send({
      meta: {
        message: error.message,
        code: res.statusCode,
        success: false,
      }
    })
  }
}

const updatePemasanganPermintaanKirimToko = async (req, res) => {
  let currentUser = checkCurrentAuthorization(req);
  let id = parseInt(req.query.id);
  let quantity = parseInt(req.query.quantity);
  let user_id = currentUser.id_karyawan;
  let nomorData;
  let query;
  let process;
  let currentData;

  try {
    if (Number.isNaN(id)) throw new TypeError('Id harus berupa angka.');
    if (Number.isNaN(quantity)) throw new TypeError('Quantity harus berupa angka.');
    if (!quantity) throw new TypeError('Quantity tidak boleh kosong.');

    query = `
      SELECT * FROM f_relasi_no_data_permintaan_kirim_toko WHERE id = ` + id;
    process = await db_accounting_and_factory.query(query, function (err, result){
      if (err) throw err;
    });
    currentData = process[0];
    if (currentData.length === 0) throw new TypeError('Data dengan id ' + id + ' tidak ditemukan!');
    nomorData = currentData[0].no_data;

    // cek stok pabrik
    query = `      
      SELECT s.no_kp no_data, s.no_po_toko, s.jenis_kain nama_kain_pabrik, s.nama_kain_toko, s.nama_warna nama_warna_pabrik, s.nama_warna_toko,
      pm.tanggal_terima, s.tanggal_jam tgl_update_stok, 
      s.jumlah_stok_siap_kirim,       
      IFNULL((SELECT SUM(a2.jml_roll) FROM tbl_sj_matang a1 JOIN tbl_sj_matang_det a2 ON (a1.id_sj=a2.id_sj)
      WHERE a1.status=2 AND a2.no_kp=s.no_kp AND a1.tanggal>DATE(NOW())), 0) jml_kirim,
      pm.lebar, pm.gramasi, pm.keterangan,
      (SELECT SUM(quantity) FROM f_relasi_no_data_permintaan_kirim_toko a WHERE a.no_data = s.no_kp) AS quantity_pemasangan,
      s.jumlah_stok_siap_kirim - (SELECT quantity_pemasangan) AS quantity_sisa
      FROM tbl_stok_kain_matang_siap_kirim s
      JOIN tbl_penerimaan_kainmatang pm ON (pm.no_sj_matang=s.no_kp)
      WHERE s.jenis_po='STOK' AND s.status_data='DATA'
      AND s.jumlah_stok_siap_kirim>0 AND s.no_kp = '` + nomorData + `'`;
    process = await db_accounting_and_factory.query(query, function (err, result){
      if (err) throw err;
    });
    currentData = process[0];
    if (currentData.length === 0) throw new TypeError('No Data ' + nomorData + ' tidak ditemukan!');

    let qtyPemasangan = currentData[0].quantity_pemasangan;
    let qtySisa = currentData[0].quantity_sisa;
    if (quantity > qtyPemasangan) throw new TypeError('Jumlah stok saat ini ' + qtySisa + '. Quantity tidak mencukupi.');

    // update query
    query = `
      UPDATE f_relasi_no_data_permintaan_kirim_toko 
      SET 
          quantity = ` + quantity + `,
          user_id = ` + user_id + `
      WHERE
          id = ` + id;
    process = await db_accounting_and_factory.query(query, function (err, result){
      if (err) throw err;
    });

    return res.status(200).send({
      meta: {
        message: "Update Pemasangan Permintaan Kirim Toko " + nomorData + " Berhasil.",
        code: res.statusCode,
        success: true,
      }
    })
  } catch (error) {
    return res.status(400).send({
      meta: {
        message: error.message,
        code: res.statusCode,
        success: false,
      }
    })
  }
}

const deletePemasanganPermintaanKirimToko = async (req, res) => {
  let id = parseInt(req.query.id);
  let nomorData;
  let query;
  let process;
  let currentData;

  try {
    if (Number.isNaN(id)) throw new TypeError('Id harus berupa angka.');
    if (!id) throw new TypeError('Id tidak boleh kosong.');

    query = `
      SELECT * FROM f_relasi_no_data_permintaan_kirim_toko WHERE id = ` + id + ` AND status = 0`;
    process = await db_accounting_and_factory.query(query, function (err, result){
      if (err) throw err;
    });
    currentData = process[0];
    if (currentData.length === 0) throw new TypeError('Data dengan id ' + id + ' tidak ditemukan!');
    nomorData = currentData[0].no_data;

    query = `
      UPDATE f_relasi_no_data_permintaan_kirim_toko 
      SET 
        status = 1 
      WHERE 
        id = ` + id;
    process = await db_accounting_and_factory.query(query, function (err, result){
      if (err) throw err;
    });

    return res.status(200).send({
      meta: {
        message: "Hapus Pemasangan Permintaan Kirim Toko " + nomorData + " Berhasil.",
        code: res.statusCode,
        success: true,
      }
    })
  } catch (error) {
    return res.status(400).send({
      meta: {
        message: error.message,
        code: res.statusCode,
        success: false,
      }
    })
  }
}

const listStokKainPabrik = async (req, res) => {
  let query;
  let process;
  let currentData;

  try {
    query = `
      SELECT (@rownum:=@rownum+1) AS id,s.no_kp no_data, s.no_po_toko, s.jenis_kain nama_kain_pabrik, s.nama_kain_toko, s.nama_warna nama_warna_pabrik, s.nama_warna_toko,
      pm.tanggal_terima, s.tanggal_jam tgl_update_stok, s.jumlah_stok_siap_kirim, 
      IFNULL((SELECT SUM(a2.jml_roll) FROM tbl_sj_matang a1 JOIN tbl_sj_matang_det a2 ON (a1.id_sj=a2.id_sj) 
      WHERE a1.status=2 AND a2.no_kp=s.no_kp AND a1.tanggal>DATE(NOW())), 0) jml_kirim,
      pm.lebar, pm.gramasi, pm.keterangan
      FROM (tbl_stok_kain_matang_siap_kirim s
      JOIN tbl_penerimaan_kainmatang pm ON (pm.no_sj_matang=s.no_kp)),
      (SELECT @rownum := 0) r
      WHERE s.jenis_po='STOK' AND s.status_data='DATA'
      AND s.jumlah_stok_siap_kirim>0`;
    process = await db_accounting_and_factory.query(query, function (err, result){
      if (err) throw err;
    });
    currentData = process[0];

    return res.status(200).send({
      meta: {
        message: "Succcess",
        code: res.statusCode,
        success: true,
      }, data: currentData
    })
  } catch (error) {
    return res.status(400).send({
      meta: {
        message: error.message,
        code: res.statusCode,
        success: false,
      }
    })
  }
}

const addPemasanganPermintaanKirimToko = async (req, res) => {
  // let currentUser = checkCurrentAuthorization(req);
  let id_f_tbl_permintaan_kirim_toko = parseInt(req.query.id);
  let dataNumber = req.query.nomorData;
  let quantity = parseInt(req.query.quantity);
  let user_id = 0;
  let query;
  let process;
  let currentData;

  try {
    if (Number.isNaN(id_f_tbl_permintaan_kirim_toko)) throw new TypeError('id harus berupa angka.');
    if (!id_f_tbl_permintaan_kirim_toko) throw new TypeError('id tidak boleh kosong.');
    if (!dataNumber) throw new TypeError('nomorData tidak boleh kosong!');
    if (Number.isNaN(quantity)) throw new TypeError('quantity harus berupa angka.');
    if (!quantity) throw new TypeError('quantity tidak boleh kosong.');
    
    query = `
      SELECT * FROM f_relasi_no_data_permintaan_kirim_toko WHERE no_data = '` + dataNumber + `' AND status = 0`;
    process = await db_accounting_and_factory.query(query, function (err, result){
      if (err) throw err;
    });
    currentData = process[0];
    if (currentData.length > 0) throw new TypeError('No Data ' + dataNumber + ' telah digunakan.');

    // cek stok pabrik
    query = `
      SELECT s.no_kp no_data, s.no_po_toko, s.jenis_kain nama_kain_pabrik, s.nama_kain_toko, s.nama_warna nama_warna_pabrik, s.nama_warna_toko,
        pm.tanggal_terima, s.tanggal_jam tgl_update_stok, s.jumlah_stok_siap_kirim, 
        IFNULL((SELECT SUM(a2.jml_roll) FROM tbl_sj_matang a1 JOIN tbl_sj_matang_det a2 ON (a1.id_sj=a2.id_sj) 
        WHERE a1.status=2 AND a2.no_kp=s.no_kp AND a1.tanggal>DATE(NOW())), 0) jml_kirim,
        pm.lebar, pm.gramasi, pm.keterangan
        FROM tbl_stok_kain_matang_siap_kirim s
        JOIN tbl_penerimaan_kainmatang pm ON (pm.no_sj_matang=s.no_kp)
        WHERE s.jenis_po='STOK' AND s.status_data='DATA'
        AND s.jumlah_stok_siap_kirim>0 AND s.no_kp = '` + dataNumber + `'`;
    process = await db_accounting_and_factory.query(query, function (err, result){
      if (err) throw err;
    });
    currentData = process[0];

    let selectedData = currentData[0];
    if (selectedData) {
      if (quantity > selectedData.jumlah_stok_siap_kirim) {
        throw new TypeError('Jumlah stok saat ini ' + selectedData.jumlah_stok_siap_kirim + '. Quantity tidak mencukupi.');
      }
  
      // save data
      query = `
        INSERT INTO 
        f_relasi_no_data_permintaan_kirim_toko
        (id_f_tbl_permintaan_kirim_toko, no_data, quantity, tanggal_input, user_id) 
        VALUES (` + id_f_tbl_permintaan_kirim_toko + `, '` + selectedData.no_data + `', ` + quantity + `, ` + ` NOW() ` + `, ` + user_id + `)`;
      process = await db_accounting_and_factory.query(query, function (err, result){
        if (err) throw err;
      });
  
      return res.status(200).send({
        meta: {
          message: "Tambah Pemasangan Permintaan Kirim Toko " + selectedData.nama_kain_toko + " " + selectedData.nama_warna_toko + " Berhasil.",
          code: res.statusCode,
          success: true,
        }
      })
    } else {
      throw new Error('Stok no data ' + dataNumber + ' tidak mencukupi.')
    }
  } catch (error) {
    return res.status(400).send({
      meta: {
        message: error.message,
        code: res.statusCode,
        success: false,
      }
    })
  }
}

const requestListKonfirmasiPermintaanKirimToko = async (req, res) => {
  let mulaiTangalKirim = req.query.mulaiTangalKirim;
  let akhirTangalKirim = req.query.akhirTangalKirim;

  try {
    if (!mulaiTangalKirim) throw new TypeError('Mulai Tangal Kirim tidak boleh kosong.');
    if (!akhirTangalKirim) throw new TypeError('Akhir Tangal Kirim tidak boleh kosong.');
    
    let query = `
      SELECT km.*, p.id_karyawan
      FROM tbl_permintaan_kirim_master km
      JOIN f_relasi_permintaan_kirim_toko_dengan_tbl_permintaan_kirim r ON (r.no_permintaan_kirim_pabrik_master = km.id)
      JOIN tbl_permintaan_kirim p ON (p.no_permintaan_kirim = r.no_permintaan_kirim_pabrik)
      WHERE km.tanggal_kirim BETWEEN '` + mulaiTangalKirim + ` 00:00:00' AND '` + akhirTangalKirim + ` 23:59:59'
      GROUP BY km.id`;
    let process = await db_accounting_and_factory.query(query, function (err, result){
      if (err) throw err;
    });
    currentData = process[0];

    return res.status(200).send({
      meta: {
        message: "Success",
        code: res.statusCode,
        success: true,
      }, data: currentData
    })
  } catch (error) {
    return res.status(400).send({
      meta: {
        message: error.message,
        code: res.statusCode,
        success: false,
      }
    })
  }
}

const listDetailsKonfirmasiPermintaanKirimToko = async (req, res) => {
  let idMaster = parseInt(req.query.idMaster);

  try {
    if (Number.isNaN(idMaster)) throw new TypeError('idMaster harus berupa angka.');
    
    let query = `
      SELECT 
        km.id AS id_master, 
        p.no_permintaan_kirim,
        p.kode_customer,
        p.no_pofu,
        p.no_detail_postok,
        p.no_penerimaan,
        p.no_data,
        p.seting,
        p.gramasi,
        p.jml_roll,
        p.keterangan,
        p.idx,
        CASE p.idx
          WHEN 0 THEN 'Baru'
          WHEN 1 THEN 'Buat SJ'
          WHEN 2 THEN 'Selesai'
          WHEN 4 THEN 'Dibatalkan'
          ELSE NULL
        END AS 'status',
        p.id_karyawan,
        p.id_booking
      FROM tbl_permintaan_kirim_master km
      JOIN f_relasi_permintaan_kirim_toko_dengan_tbl_permintaan_kirim r ON (r.no_permintaan_kirim_pabrik_master = km.id)
      JOIN tbl_permintaan_kirim p ON (p.no_permintaan_kirim = r.no_permintaan_kirim_pabrik)
      WHERE km.id = ` + idMaster;
    let process = await db_accounting_and_factory.query(query, function (err, result){
      if (err) throw err;
    });
    let currentData = process[0];

    return res.status(200).send({
      meta: {
        message: "Success",
        code: res.statusCode,
        success: true,
      }, data: currentData
    })
  } catch (error) {
    return res.status(400).send({
      meta: {
        message: error.message,
        code: res.statusCode,
        success: false,
      }
    })
  }
}

const saveKonfirmasiPermintaanKirimToko = async (req, res) => {  
  let currentUser = checkCurrentAuthorization(req);
  let user_id = currentUser.id_karyawan;
  let requestBody = req.body;  
  let id_f_relasi_no_data_permintaan_kirim_toko = parseInt(req.query.idDetailToko);
  let customer = req.query.customer;
  let tanggal_kirim = req.query.tanggalKirim;
  let querySql;
  let processQuery;

  try {
    const promises = requestBody.map(async (item, key) => {
      querySql = `
        INSERT INTO tbl_permintaan_kirim (
          tanggal_input,
          tanggal_kirim,
          kode_customer,
          nama_customer,
          no_pofu,
          no_detail_postok,
          no_penerimaan, 
          no_data, 
          seting, 
          gramasi, 
          jml_roll, 
          jenis_pengiriman, 
          keterangan, 
          id_karyawan
        ) 
        VALUES (
          NOW(),
          '` + tanggal_kirim + `',
          ` + item.kode_customer + `,
          '` + customer + `',
          '` + item.no_pofu + `',
          ` + item.no_detail_postok + `,
          ` + item.no_penerimaan + `, 
          '` + item.no_data + `', 
          ` + item.seting + `, 
          '` + item.gramasi + `', 
          ` + item.jumlah_stok_siap_kirim + `, 
          '` + PENJUALAN + `', 
          '` + item.keterangan + `', 
          ` + user_id + `
        )
      `;
      processQuery = await db_accounting_and_factory.query(querySql, function (err, result){
        if (err) throw err;
      });
      let insertPermintaanKirimId = processQuery[0];

      querySql = `
        INSERT INTO tbl_permintaan_kirim_master (
          tanggal_input,
          tanggal_kirim,
          kode_customer,
          nama_customer
        )
        VALUES (
          NOW(),
          '` + tanggal_kirim + `',
          ` + item.kode_customer + `,
          '` + customer + `'
        )
      `;
      processQuery = await db_accounting_and_factory.query(querySql, function (err, result){
        if (err) throw err;
      });
      let insertPermintaanKirimMasterId = processQuery[0];

      querySql = `
        INSERT INTO f_relasi_permintaan_kirim_toko_dengan_tbl_permintaan_kirim (
          no_permintaan_kirim_pabrik,
          no_permintaan_kirim_pabrik_master,
          no_permintaan_kirim_toko
        )
        VALUES (
          ` + insertPermintaanKirimId + `,
          ` + insertPermintaanKirimMasterId + `,
          ` + id_f_relasi_no_data_permintaan_kirim_toko + `
        )
      `;
      processQuery = await db_accounting_and_factory.query(querySql, function (err, result){
        if (err) throw err;
      });
    });    
    await Promise.all(promises)

    return res.status(200).send({
      meta: {
        message: "Penyimpanan konfirmasi permintaan kirim toko berhasil.",
        code: res.statusCode,
        success: true,
      }
    })
  } catch (error) {
    return res.status(400).send({
      meta: {
        message: error.message,
        code: res.statusCode,
        success: false,
      }
    })
  }
}

const updateKonfirmasiPermintaanKirimToko = async (req, res) => {
  let currentUser = checkCurrentAuthorization(req);
  let noPermintaanKirim = parseInt(req.query.noPermintaanKirim);
  let quantity = parseInt(req.query.quantity);
  let user_id = currentUser.id_karyawan;
  let query;
  let process;
  let currentData;

  try {
    if (Number.isNaN(noPermintaanKirim)) throw new TypeError('noPermintaanKirim harus berupa angka.');
    if (Number.isNaN(quantity)) throw new TypeError('Quantity harus berupa angka.');

    query = `
      SELECT no_permintaan_kirim FROM tbl_permintaan_kirim WHERE no_permintaan_kirim = ` + noPermintaanKirim;
    process = await db_accounting_and_factory.query(query, function (err, result){
      if (err) throw err;
    });
    currentData = process[0];
    if (currentData.length === 0) throw new TypeError('Data dengan no permintaan kirim ' + noPermintaanKirim + ' tidak ditemukan!');

    // let qtyPemasangan = currentData[0].quantity_pemasangan;
    // let qtySisa = currentData[0].quantity_sisa;
    // if (quantity > qtyPemasangan) throw new TypeError('Jumlah stok saat ini ' + qtySisa + '. Quantity tidak mencukupi.');

    query = `
      UPDATE tbl_permintaan_kirim
      SET jml_roll = ` + quantity + `, id_karyawan = ` + user_id + `
      WHERE no_permintaan_kirim = ` + noPermintaanKirim;
    process = await db_accounting_and_factory.query(query, function (err, result){
      if (err) throw err;
    });

    return res.status(200).send({
      meta: {
        message: "Update Konfirmasi Permintaan Kirim Toko " + noPermintaanKirim + " Berhasil.",
        code: res.statusCode,
        success: true,
      }
    })
  } catch (error) {
    return res.status(400).send({
      meta: {
        message: error.message,
        code: res.statusCode,
        success: false,
      }
    })
  }
}

const pembatalanKonfirmasiPermintaanKirimToko = async (req, res) => {
  let idDetailPabrik = parseInt(req.query.idDetailPabrik);
  let querySql;
  let processQuery;
  let resultQuery;

  try {
    querySql = `
      SELECT * FROM f_relasi_permintaan_kirim_toko_dengan_tbl_permintaan_kirim WHERE no_permintaan_kirim_pabrik = ` + idDetailPabrik + `
    `;
    processQuery = await db_accounting_and_factory.query(querySql, function (err, result){
      if (err) throw err;
    });
    if (processQuery[0].length === 0) throw new Error("Data dengan id " + idDetailPabrik + " tidak ditemukan!");
    resultQuery = processQuery[0];

    querySql = `
      UPDATE tbl_permintaan_kirim
      SET idx = 4
      WHERE no_permintaan_kirim = ` + resultQuery[0].no_permintaan_kirim_pabrik + `
    `;
    processQuery = await db_accounting_and_factory.query(querySql, function (err, result){
      if (err) throw err;
    });

    return res.status(200).send({
      meta: {
        message: "Pembatalan permintaan kirim toko berhasil.",
        code: res.statusCode,
        success: true,
      }
    })
  } catch (error) {
    return res.status(400).send({
      meta: {
        message: error.message,
        code: res.statusCode,
        success: false,
      }
    })
  }
}

module.exports = { 
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
}
