/* eslint-disable eqeqeq */
import React, { useRef, useState } from "react";
import * as XLSX from "xlsx";
import {
  checkDuLieu,
  checkTrungChiTieu,
  convertDataChuan,
  getSheetNameContainOriginName,
} from "./ExelHelper";

let listLogDataGlobal = [];
function App() {
  const inputFile = useRef(null);
  const [logFiles, setLogFiles] = useState([]);

  const onClickChooseFolderIn = () => {
    listLogDataGlobal = [];
    inputFile?.current?.click();
  };

  const onSelectedFiles = (event) => {
    let filesLength = inputFile?.current?.files?.length;
    let dataLog = [];
    dataLog.push({
      color: "blue",
      message: `Đọc được tổng ${filesLength} files`,
    });
    Array.from(inputFile?.current?.files)?.forEach((element) => {
      if (
        element?.type !== "application/vnd.ms-excel" &&
        element?.type !=
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      ) {
        dataLog.push({
          color: "red",
          message: `Filename - ${element?.name} - không phải là file exel`,
        });
      }
    });
    setLogFiles([...dataLog]);
  };

  const onStartScanData = async () => {
    if (inputFile?.current?.files.length > 0) {
      Promise.all(
        Array.from(inputFile?.current?.files).map((file) => {
          return getDataExelFile(file);
        })
      ).then((dataFull) => {
        console.log("dataFull", dataFull);
        let newDataFull = dataFull.filter((data) => data !== null);
        let aoaFinalData = convertDataToAoA(newDataFull);
        setLogFiles([...logFiles, ...listLogDataGlobal]);
        var worksheet = XLSX.utils.aoa_to_sheet(aoaFinalData);
        var new_workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(new_workbook, worksheet, "SheetJS");
        XLSX.writeFile(new_workbook, "out.xls");
      });
    } else {
      listLogDataGlobal.push({
        color: "red",
        message: "Không tìm thấy file nào để quét",
      });
    }
  };

  const convertDataToAoA = (dataBaoCao) => {
    let aoaFinalWorkBook = [];
    let danhSachChiTieu = [];
    let danhSachChiTieuText = [];
    let danhSachDonVi = [];

    danhSachChiTieu[0] = "";
    danhSachDonVi[0] = "";
    let mainChiTieuIndex = 1;

    // ? nap chi tieu
    dataBaoCao.forEach((dataDonVi, index) => {
      let notFoundChiTieu = [];
      let notFound = true;

      dataDonVi?.chiTieu?.forEach((chiTieu) => {
        if (index == 0) {
          chiTieu.duLieuVaDonVi.forEach((dvdl) => {
            danhSachChiTieu[mainChiTieuIndex] = chiTieu;
            danhSachChiTieuText[mainChiTieuIndex] = chiTieu?.tenChiTieu;
            danhSachDonVi[mainChiTieuIndex] = dvdl?.donVi;
            mainChiTieuIndex += 1;
          });
        } else {
          for (
            let chiTieuIndex = 0;
            chiTieuIndex < danhSachChiTieu.length;
            chiTieuIndex++
          ) {
            const oldChiTieu = danhSachChiTieu[chiTieuIndex];
            if (
              checkTrungChiTieu(
                oldChiTieu?.tenChiTieu,
                oldChiTieu?.phanTo,
                chiTieu?.tenChiTieu,
                oldChiTieu?.phanTo
              )
            ) {
              notFound = false;
              break;
            }
          }
        }
        if (notFound && index > 0) {
          notFoundChiTieu.push(chiTieu);
          listLogDataGlobal.push({
            color: "green",
            message: `Phát hiện thêm chỉ tiêu mới - ${chiTieu?.tenChiTieu} - của đơn vị -  ${dataDonVi?.tenDonVi} trong file -> ${chiTieu?.fileName}`,
          });
          console.log(
            `Không tìm thấy chỉ tiêu -> ${chiTieu?.tenChiTieu} - của ->: ${dataDonVi?.tenDonVi} -> ${chiTieu?.fileName}`,
            chiTieu
          );
        }
      });
      // ? nap cac chi tieu con thieu
      if (notFoundChiTieu?.length > 0) {
        console.log("notFoundChiTieu", notFoundChiTieu);
        notFoundChiTieu?.forEach((nfChiTieu) => {
          nfChiTieu?.duLieuVaDonVi.forEach((nfCTDL) => {
            danhSachChiTieu[danhSachChiTieu.length] = nfChiTieu;
            danhSachChiTieuText[danhSachChiTieuText.length] =
              nfChiTieu?.tenChiTieu;
            danhSachDonVi[danhSachDonVi.length] = nfCTDL?.donVi;
          });
        });
      }
    });

    console.log("Nạp xong chỉ tiêu, danh sách -> ", danhSachChiTieu);
    // ? nap du lieu
    dataBaoCao.forEach((dataDonVi, index) => {
      let danhSachDuLieu = [];
      danhSachDuLieu[0] = dataDonVi?.tenDonVi;
      dataDonVi?.chiTieu?.forEach((chiTieu) => {
        for (
          let chiTieuIndex = 0;
          chiTieuIndex < danhSachChiTieu.length;
          chiTieuIndex++
        ) {
          const oldChiTieu = danhSachChiTieu[chiTieuIndex];
          if (
            checkTrungChiTieu(
              oldChiTieu?.tenChiTieu,
              oldChiTieu?.phanTo,
              chiTieu?.tenChiTieu,
              oldChiTieu?.phanTo
            )
          ) {
            chiTieu?.duLieuVaDonVi?.forEach((dldv, indexDldv) => {
              danhSachDuLieu[chiTieuIndex + indexDldv] = dldv?.duLieu;
            });
            break;
          }
        }
      });

      //? kiểm tra xem có dữ liệu nào còn thiếu thì thêm số 0 vào
      for (
        let thieuIndex = 0;
        thieuIndex < danhSachChiTieu.length;
        thieuIndex++
      ) {
        if (danhSachDuLieu[thieuIndex] === undefined) {
          danhSachDuLieu[thieuIndex] = 0;
        }
      }
      aoaFinalWorkBook.push(danhSachDuLieu);
    });
    aoaFinalWorkBook = [
      danhSachChiTieuText,
      danhSachDonVi,
      ...aoaFinalWorkBook,
    ];
    console.log("aoaFinalWorkBook", aoaFinalWorkBook);
    return aoaFinalWorkBook;
  };
  //! Đọc file exel và lấy thông tin
  const getDataExelFile = (file) => {
    return new Promise((resolve, reject) => {
      let dataOfFile = null;
      const reader = new FileReader();
      reader.onerror = (error) => {
        console.log("Đọc file lỗi", error);
      };
      reader.onload = (evt) => {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        // const foundedName = wb.SheetNames[0];
        const foundedName = getSheetNameContainOriginName(wb.SheetNames);
        if (foundedName !== null) {
          const ws = wb.Sheets[foundedName];
          // const data = XLSX.utils.sheet_to_csv(ws, { header: 1 });
          const data = XLSX.utils.sheet_to_row_object_array(ws, {
            header: [
              "col1",
              "col2",
              "col3",
              "col4",
              "col5",
              "col6",
              "col7",
              "col8",
              "col9",
              "col10",
            ],
          });
          //! Tạo danh sách chỉ tiêu
          dataOfFile = getDataFromAFile(data, file.name);
          resolve(dataOfFile);
        } else {
          listLogDataGlobal.push({
            color: "red",
            message: `Không tìm thấy sheet cần đọc tại file -> ${file.name}`,
          });
          resolve(null);
          console.log(`Không tìm thấy sheet cần đọc tại file -> ${file.name}`);
        }
      };
      reader.readAsBinaryString(file);
    });
  };

  //! lấy dữ liệu từ 1 file
  const getDataFromAFile = (data, fileName) => {
    let dataOfAfile = null;
    let danhSachChiTieuCuaMotFile = [];
    let isStartFillData = false;
    let phanTo = "";
    for (let index = 0; index < data.length; index++) {
      const row = data[index];
      //! kiểm tra nếu chạm "A" là đã tới lúc cần đọc dữ liệu

      if (isStartFillData) {
        if (row?.col2 == undefined || row?.col2 == null) {
          continue;
        }
        if (row?.col2 == "TỔNG HỢP, LẬP BIỂU") {
          break;
        }

        // ? Thay đổi phân tổ
        if (row?.col2?.includes("Phân tổ")) {
          phanTo = row?.col2;
          continue;
        }

        // if (danhSachChiTieu.length > 1) {
        //   let isHaveSameData = false;
        //   danhSachChiTieu.forEach((chiTieu) => {
        //     if (chiTieu.name == row?.col2 && chiTieu?.phanTo == phanTo) {
        //       isHaveSameData = true;
        //       console.log("same", chiTieu.name);
        //       return;
        //     }
        //   });
        //   if (isHaveSameData) {
        //     continue;
        //   }
        // }
        //? Chứa dữ liệu và đơn vị tính
        let duLieuVaDonVi = [];
        duLieuVaDonVi.push({
          donVi: row?.col4,
          duLieu: convertDataChuan(row?.col5),
        });
        if (index < data.length - 1) {
          const nextRow = data[index + 1];
          if (checkDuLieu(nextRow)) {
            duLieuVaDonVi.push({
              donVi: nextRow?.col4,
              duLieu: convertDataChuan(nextRow?.col5),
            });
          }
        }
        // ? Tạo object cho từng chỉ tiêu
        let tenChiTieu = row?.col2;
        if (tenChiTieu == undefined || typeof tenChiTieu == "number") {
          console.log(`Sai tên chỉ tiêu trong file`, fileName);
        }
        const chiTieuMoi = { tenChiTieu, duLieuVaDonVi, phanTo, fileName };
        danhSachChiTieuCuaMotFile.push(chiTieuMoi);
      }
      if (row?.col2 === "B" && !isStartFillData) {
        isStartFillData = true;
      }
    }
    let tenDonVi = "";
    try {
      tenDonVi = data[0].col5.split("\n")[1];
      if (tenDonVi.trim() == "") {
        tenDonVi = fileName;
      }
    } catch (e) {
      console.log(`Lỗi tại file ${fileName}`, e);
      listLogDataGlobal.push({
        color: "red",
        message: `Không tìm thấy tên đơn vị tại file - ${fileName} - sử dụng filename làm tên`,
      });
      tenDonVi = fileName;
    }
    dataOfAfile = { tenDonVi, chiTieu: danhSachChiTieuCuaMotFile };
    return dataOfAfile;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
      {/* button */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          width: "100%",
          padding: 10,
          justifyContent: "space-evenly",
        }}
      >
        <input
          type="file"
          id="file"
          multiple
          ref={inputFile}
          style={{ display: "none" }}
          onChange={(event) => {
            onSelectedFiles(event);
          }}
        />
        <button
          onClick={onClickChooseFolderIn}
          style={{
            fontWeight: "bold",
            padding: "10px",
            border: "1px solid rgba(0, 0, 0, 1)",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Chọn các file exel
        </button>
        <button
          onClick={onStartScanData}
          style={{
            fontWeight: "bold",
            padding: "10px",
            border: "1px solid rgba(0, 0, 0, 1)",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Bắt đầu quét
        </button>
        {/* log file */}
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "1000px",
          width: "100%",
          marginTop: 10,
          overflowY: "scroll",
          border: "1px solid rgba(0, 0, 0, 0.2)",
          padding: "5px",
          backgroundColor: "#F1ECC3",
        }}
      >
        {!!logFiles &&
          logFiles?.map((item, index) => (
            <span
              style={{
                fontSize: 13,
                width: "100%",
                marginBottom: 10,
                paddingBottom: 3,
                color: item?.color,
              }}
              key={index.toString()}
            >
              {item?.message}
            </span>
          ))}
      </div>
    </div>
  );
}

export default App;
