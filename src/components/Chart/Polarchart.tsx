import { PolarArea } from 'react-chartjs-2';
export default function AreaChart({ chartData, chartFetchCB, chartRef }: any) {
  return (
    <div className='aspect-[2/1]'>
      <PolarArea
        ref={chartRef}
        data={chartData}
        options={{
          plugins: {
            title: {
              display: true,
              // text: "example caption",
            },
            legend: {
              display: false,
            },
            zoom: {
              pan: {
                enabled: true,
                mode: 'x',
                modifierKey: 'shift',
              },
              zoom: {
                drag: {
                  enabled: true,
                },
                pinch: {
                  enabled: true,
                },
                mode: 'x',
                onZoomComplete: chartFetchCB,
              },
            },
          },
        }}
      />
    </div>
  );
}
