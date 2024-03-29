import { useCallback, useMemo, useState } from 'react';
import Chart from './Chart';
import {
  Button,
  Select,
  Option,
  Tabs,
  TabsHeader,
  TabsBody,
  Tab,
  TabPanel,
  Input,
  Textarea,
} from '@material-tailwind/react';
import { getXAxis, openFile, debouncedCallBack } from '../utils';
import Table from './Table';
import Analytics from './Analytics';

const options = {
  Composition: [
    { label: 'Pie chart', value: 'Pie' },
    { label: 'Donought chart', value: 'Donought' },
  ],
  Distribution: [
    { label: 'Bar chart (Histogram)', value: 'Bar' },
    { label: 'Line chart (Area)', value: 'Line' },
  ],
  Trends: [
    { label: 'Coloumn char', value: 'Bar' },
    { label: 'Line chart', value: 'Line' },
  ],
  Comparision: [
    { label: 'Line chart', value: 'Line' },
    { label: 'Scatter plot', value: 'Scatter' },
  ],
};

export default function Homepage() {
  const [file, setFile] = useState<string>('');

  const [userPurpose, setUserPurpose] = useState<UserPurpose>();
  const [chartType, setChartType] = useState<ChartType>('Bar');
  const [columns, setColumns] = useState<string[]>([]);

  const [xAxis, setXAxis] = useState<string>();
  const [yAxis, setYAxes] = useState<string>();
  const [groupBy, setGroupBy] = useState<string>();

  const [rows, setRows] = useState<number>(0);
  const [offset, setOffset] = useState<number>(0);
  const [range, setRange] = useState<number>(10);

  const debouncedSetRange = useMemo(() => debouncedCallBack(setRange, 400), []);
  const debouncedSetOffset = useMemo(
    () => debouncedCallBack(setOffset, 400),
    []
  );

  const importData = () => {
    openFile().then(([fileName, columnsOfFile]) => {
      clearParams();
      setFile(fileName);
      setColumns(columnsOfFile);
    });
  };

  const clearParams = () => {
    setXAxis(undefined);
    setYAxes(undefined);
    setGroupBy(undefined);
    handleXAxisChange(undefined);
  };

  const handleXAxisChange = (value?: string) => {
    setXAxis(value);
    if (value) {
      getXAxis(file, value).then((res) => {
        setRows(res);
        setRange(res);
        setOffset(0);
      });
    } else {
      setRows(0);
    }
  };

  const extractText = useCallback(
    (text: string) => {
      const words = text.split(' ');
      const chartType = words.find((word) =>
        ['Line', 'Bar', 'Pie', 'Scatter', 'Doughnut'].includes(word)
      );
      if (chartType) {
        switch (chartType) {
          case 'Line':
            setUserPurpose('Trends');
            break;
          case 'Bar':
            setUserPurpose('Distribution');
            break;
          case 'Pie':
            setUserPurpose('Composition');
            break;
          case 'Scatter':
            setUserPurpose('Comparision');
            break;
          case 'Doughnut':
            setUserPurpose('Composition');
            break;
        }
        setChartType(chartType as ChartType);
      }
      const cols: string[] = words.filter((word) => columns.includes(word));
      if (cols.length > 0) {
        const xAxis = cols[0];
        handleXAxisChange(xAxis);
      }
      if (cols.length > 1) {
        const yAxis = cols[1];
        setYAxes(yAxis);
      }
    },
    [columns]
  );

  const descriptionChange = useMemo(
    () => debouncedCallBack(extractText, 400),
    [extractText]
  );

  return (
    <div className=' w-full h-screen flex flex-row'>
      {/* left panel */}
      <div className=' w-1/5 bg-blue-gray-50 p-4 rounded-md h-full overflow-y-auto'>
        <h1 className=' text-left pl-5 font-bold font-mono text-3xl'>DaViz</h1>
        <div className=' text-center mx-auto my-16'>
          <div className=' space-y-6'>
            <Button className='w-full' onClick={() => importData()}>
              import dataset
            </Button>

            {options && (
              <Select
                label='Purpose'
                value={userPurpose}
                onChange={setUserPurpose as any}>
                {Object.keys(options).map((item, index) => (
                  <Option value={item} key={index}>
                    {item}
                  </Option>
                ))}
              </Select>
            )}
            {userPurpose && (
              <Select
                label='Select chart type'
                key={userPurpose + chartType}
                value={chartType}
                onChange={setChartType as any}>
                {options[userPurpose].map((item, index) => {
                  return (
                    <Option value={item.value} key={index}>
                      {item.label}
                    </Option>
                  );
                })}
              </Select>
            )}

            {columns.length > 0 && (
              <>
                <Select
                  label='Choose the x-axis'
                  value={xAxis}
                  key={xAxis}
                  onChange={handleXAxisChange}>
                  {columns.map((item, index) => (
                    <Option key={index} value={item}>
                      {item}
                    </Option>
                  ))}
                </Select>

                <Select
                  label='Choose the y-axis'
                  key={yAxis}
                  value={yAxis}
                  onChange={setYAxes}>
                  {columns.map((item) => (
                    <Option key={item} value={item}>
                      {item}
                    </Option>
                  ))}
                </Select>

                <Select
                  label='Group by'
                  key={groupBy}
                  value={groupBy}
                  onChange={setGroupBy}>
                  {columns.map((item) => (
                    <Option key={item} value={item}>
                      {item}
                    </Option>
                  ))}
                </Select>

                {rows > 0 && (
                  <>
                    <Input
                      type='number'
                      key={offset}
                      defaultValue={offset}
                      onChange={(e) =>
                        debouncedSetOffset(parseInt(e.target.value))
                      }
                      label='Offset'
                    />
                    <Input
                      type='number'
                      key={range}
                      defaultValue={range}
                      onChange={(e) =>
                        debouncedSetRange(parseInt(e.target.value))
                      }
                      label='Range'
                    />
                  </>
                )}
                <Button
                  color='blue-gray'
                  onClick={clearParams}
                  className='w-full'>
                  Clear Params
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* center panel */}
      <div className='p-2 w-3/5 h-screen overflow-y-auto flex flex-col'>
        <div className='flex-grow'>
          <Tabs value='chart'>
            <TabsHeader className='content-center'>
              <Tab value='chart'>chart</Tab>
              <Tab value='table'>table</Tab>
            </TabsHeader>
            <TabsBody>
              <TabPanel value={'chart'}>
                <Chart
                  file={file}
                  xAxis={xAxis}
                  yAxis={yAxis}
                  groupBy={groupBy}
                  offset={offset}
                  range={range}
                  chartType={chartType}
                  setOffset={debouncedSetOffset}
                  setRange={debouncedSetRange}
                  numRows={rows}
                />
              </TabPanel>
              <TabPanel value={'table'}>
                <Table
                  file={file}
                  xAxis={xAxis}
                  yAxis={yAxis}
                  groupBy={groupBy}
                  offset={offset}
                  range={range}
                />
              </TabPanel>
            </TabsBody>
          </Tabs>
        </div>
        <div className='w-full flex-shrink'>
          <Textarea
            label='Describe your data'
            onChange={(e) => {
              descriptionChange(e.target.value);
            }}
          />
        </div>
      </div>

      {/* right panel */}
      <div className='w-1/5 bg-blue-gray-50 h-full overflow-y-auto p-8'>
        <Analytics
          file={file}
          xAxis={xAxis}
          yAxis={yAxis}
          groupBy={groupBy}
          offset={offset}
          range={range}
        />
      </div>
    </div>
  );
}
