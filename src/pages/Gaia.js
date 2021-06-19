import { useState } from 'react';
import { connectToGaiaHub } from '@stacks/storage';

const fileName = 'aFile.txt';

export function Gaia({ userSession }) {
  const [gaiaHubUrl, setGaiaHubUrl] = useState('http://172.18.2.2:3000');
  const [fileContent, setFileContent] = useState();

  const saveFileAction = async () => {
    try {
      const userData = await userSession.loadUserData();
      console.log(userData.appPrivateKey);
      const gaiaConfig = await connectToGaiaHub(gaiaHubUrl, userData.appPrivateKey);

      userData.gaiaHubConfig = gaiaConfig;

      const sessionData = userSession.store.getSessionData();
      sessionData.userData.gaiaHubConfig = gaiaConfig;
      userSession.store.setSessionData(sessionData);

      const storage = new Storage({ userSession });
      const result = await storage.putFile(fileName, 'plain text', {
        encrypt: false,
        contentType: 'text/plain',
        dangerouslyIgnoreEtag: true,
      });
      console.log(result);
      setFileContent(await storage.getFile(fileName, { decrypt: false }));
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <main className="panel-welcome mt-5 container">
      <div className="lead row mt-5">
        <div className="col-xs-10 col-md-8 mx-auto px-4">
          <h1 className="card-title">Gaia Experiments</h1>
        </div>
        <div className="col-xs-10 col-md-8 mx-auto mb-4 px-4">Gaia hub url: {gaiaHubUrl}</div>
        <div className="col-xs-10 col-md-8 mx-auto mb-4 px-4">
          <button onClick={saveFileAction}>Save and read file</button>
        </div>
        <div className="col-xs-10 col-md-8 mx-auto mb-4 px-4">File Content: {fileContent}</div>
        <div className="card col-md-8 mx-auto mt-5 mb-5 text-center px-0 border-warning">
          <div className="card-header">
            <h5 className="card-title">Instructions</h5>
          </div>
          <ul className="list-group list-group-flush">
            <li className="list-group-item">Enter a gaia hub url and save the file</li>
            <li className="list-group-item">The content will be shown</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
