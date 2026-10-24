// ไฟล์ภาพนามสกุลตัวพิมพ์ใหญ่ (.PNG/.JPG) ใน src/assets
declare module "*.PNG" {
  const content: import("next/dist/shared/lib/image-external").StaticImageData;
  export default content;
}
declare module "*.JPG" {
  const content: import("next/dist/shared/lib/image-external").StaticImageData;
  export default content;
}
