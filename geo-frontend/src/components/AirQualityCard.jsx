export default function AirQualityCard({ airQuality }) {
  return (
    <div className="bg-white p-4 rounded-xl shadow hover:shadow-lg transition duration-300">
      <h2 className="text-xl font-semibold mb-3 text-red-600">Air Quality</h2>
      <p><span className="font-semibold">Parameter:</span> {airQuality.parameter}</p>
      <p><span className="font-semibold">Value:</span> {airQuality.value} {airQuality.unit}</p>
    </div>
  );
}
