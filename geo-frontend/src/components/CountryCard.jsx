export default function CountryCard({ metadata }) {
  return (
    <div className="bg-white p-4 rounded-xl shadow hover:shadow-lg transition duration-300">
      <h2 className="text-xl font-semibold mb-3 text-purple-600">Country Info</h2>
      <p><span className="font-semibold">Capital:</span> {metadata.capital}</p>
      <p><span className="font-semibold">Population:</span> {metadata.population.toLocaleString()}</p>
      <p><span className="font-semibold">Currency:</span> {metadata.currency}</p>
      <p><span className="font-semibold">Languages:</span> {metadata.languages.join(", ")}</p>
      {metadata.flag && <img src={metadata.flag} alt="flag" className="mt-3 w-24 rounded" />}
    </div>
  );
}
