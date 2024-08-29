export interface IRectListItem {
  [key: string]: any;
  key?: string;
  uid: string;
  points: number[];
  /**
   * @name 框类型
   * @param 默认采用段落
   * @description  段落,列表,图像,印章,公式,水印,表格,页眉页脚
   * */
  type?: string;
}
