import Img from '@/assets/images/pic_non_textin@2x.png';

const NotFoundPage = () => {
  return (
    <div className="textin-404">
      <div className="textin-404-card">
        <img src={Img} />
        <div className="title">您访问的页面不存在</div>
      </div>
    </div>
  );
};

export default NotFoundPage;
