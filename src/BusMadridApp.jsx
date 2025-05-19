import React, { useState } from "react";
import axios from "axios";

const CLIENT_ID = "f1aeeee7-d115-4eab-8fb0-f8b50d57fd25";
const PASS_KEY = "B7D0ED002990C2B5B1BCE474DDFE28A83A852B06A037063B8304B78307BEE93D8046A37C3BCC546AEA0E66152ABF3C625DFE642F0D78E79B4A0670252C17CFB2";

export default function BusMadridApp() {
  const [stopId, setStopId] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [busData, setBusData] = useState(null);
  const [manualRequest, setManualRequest] = useState("");
  const [manualResponse, setManualResponse] = useState("");

  // Función para obtener el accessToken
  const getAccessToken = async () => {
    try {
      const response = await axios.post(
        "https://openapi.emtmadrid.es/v1/mobilitylabs/user/login/",
        {},
        {
          headers: {
            "X-ClientId": CLIENT_ID,
            passKey: PASS_KEY,
          },
        }
      );
      setAccessToken(response.data.data[0].accessToken);
      return response.data.data[0].accessToken;
    } catch (error) {
      console.error("Error al obtener el accessToken:", error);
      return null;
    }
  };

  // Función para obtener los tiempos de llegada de autobuses
  const getBusArrivalTimes = async () => {
    const token = accessToken || (await getAccessToken());
    if (!token) return;

    try {
      const response = await axios.post(
        "https://openapi.emtmadrid.es/v1/transport/busemtmad/stops/arrives/",
        {
          stopIds: [parseInt(stopId)],
        },
        {
          headers: {
            accessToken: token,
          },
        }
      );
      setBusData(response.data.data[0].Arrive);
    } catch (error) {
      console.error("Error al obtener los tiempos de llegada:", error);
    }
  };

  // Función para realizar una solicitud manual
  const handleManualRequest = async () => {
    const token = accessToken || (await getAccessToken());
    if (!token) return;

    try {
      const response = await axios.post(
        "https://openapi.emtmadrid.es/v1/transport/busemtmad/stops/arrives/",
        JSON.parse(manualRequest),
        {
          headers: {
            accessToken: token,
          },
        }
      );
      setManualResponse(JSON.stringify(response.data, null, 2));
    } catch (error) {
      console.error("Error en la solicitud manual:", error);
      setManualResponse("Error en la solicitud manual.");
    }
  };

  return (
    <div>
      <h1>Información de Parada de Autobús</h1>
      <input
        type="text"
        value={stopId}
        onChange={(e) => setStopId(e.target.value)}
        placeholder="Número de parada"
      />
      <button onClick={getBusArrivalTimes}>Obtener información</button>

      {busData && (
        <div>
          <h2>Parada: {stopId}</h2>
          {busData.map((item, index) => (
            <div key={index}>
              <h3>Línea: {item.lineId}</h3>
              <p>Destino: {item.destination}</p>
              <p>Tiempo de espera: {item.busTimeLeft} segundos</p>
              <p>Distancia: {item.busDistance} metros</p>
              <p>Bus ID: {item.busId}</p>
              <p>Posición: ({item.latitude}, {item.longitude})</p>
              <p>Tipo de posición: {item.busPositionType}</p>
              <p>¿Cabeza de línea?: {item.isHead}</p>
            </div>
          ))}
        </div>
      )}

      <div>
        <h2>Solicitud Manual</h2>
        <textarea
          value={manualRequest}
          onChange={(e) => setManualRequest(e.target.value)}
          placeholder='{"stopIds": [608]}'
          rows={10}
          cols={50}
        />
        <button onClick={handleManualRequest}>Enviar solicitud</button>
        <pre>{manualResponse}</pre>
      </div>
    </div>
  );
}
