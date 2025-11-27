import multer from "multer";

const storage = multer.memoryStorage();

const fileFilter = (req: any, file: any, cb: any) => {
  const allowedMimes = [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "application/pdf",
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only JPEG, PNG, and PDF allowed."));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
});

export const uploadSingle = upload.single("file");
export const uploadMultiple = upload.array("files", 5);
export const uploadFields = upload.fields([
  { name: "governmentId", maxCount: 1 },
  { name: "incorporationCertificate", maxCount: 1 },
  { name: "articleOfAssociation", maxCount: 1 },
  { name: "proofOfAddress", maxCount: 1 },
  { name: "selfieWithId", maxCount: 1 },
  { name: "bankStatement", maxCount: 1 },
  { name: "additionalDocuments", maxCount: 5 },
]);
