import FlightList from '../../RobotBills/components/FlightList';

interface TableListProp {
  tableList?: any[];
  width?: number;
  valueWidth?: number;
  className?: string;
  curUid?: string | number;
  onClick?: (e: any) => void;
}

export default function TableList({
  tableList,
  width,
  valueWidth,
  className,
  curUid,
  onClick,
}: TableListProp) {
  return !!tableList?.length ? (
    <div style={{ paddingLeft: 20 }} className={className}>
      <FlightList
        list={tableList}
        width={width}
        valueWidth={valueWidth}
        disabled={false}
        curUid={curUid}
        onClick={onClick}
      />
    </div>
  ) : null;
}
