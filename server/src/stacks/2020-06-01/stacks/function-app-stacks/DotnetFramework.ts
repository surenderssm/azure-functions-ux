import { FunctionAppStack } from '../../models/FunctionAppStackModel';

export const dotnetFrameworkStack: FunctionAppStack = {
  displayText: '.NET Framework',
  value: 'dotnetFramework',
  preferredOs: 'windows',
  majorVersions: [
    {
      displayText: '.NET Framework 4',
      value: '2',
      minorVersions: [
        {
          displayText: '.NET Framework 4.8',
          value: '4.8',
          stackSettings: {
            windowsRuntimeSettings: {
              runtimeVersion: '4.8',
              remoteDebuggingSupported: false,
              appInsightsSettings: {
                isSupported: false,
              },
              gitHubActionSettings: {
                isSupported: false,
              },
              appSettingsDictionary: {},
              siteConfigPropertiesDictionary: {
                use32BitWorkerProcess: true,
              },
              supportedFunctionsExtensionVersions: ['~1'],
            },
          },
        },
      ],
    },
  ],
};
