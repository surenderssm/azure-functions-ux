import React, { useContext, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Field } from 'formik';

import { DefaultButton } from '@fluentui/react';

import ReactiveFormControl from '../../../../components/form-controls/ReactiveFormControl';
import { PortalContext } from '../../../../PortalContext';
import { ContainerRegistrySources, DeploymentCenterContainerFormData, DeploymentCenterFieldProps } from '../DeploymentCenter.types';
import { extractConfigFromFile, getTelemetryInfo } from '../utility/DeploymentCenterUtility';

const DeploymentCenterContainerComposeFileUploader: React.FC<DeploymentCenterFieldProps<DeploymentCenterContainerFormData>> = props => {
  const { formProps } = props;
  const { t } = useTranslation();
  const uploadFileRef = useRef<HTMLInputElement | null>(null);

  const portalContext = useContext(PortalContext);

  const onUploadButtonClick = () => {
    portalContext.log(getTelemetryInfo('info', 'uploadButton', 'clicked'));

    if (uploadFileRef && uploadFileRef.current) {
      uploadFileRef.current.click();
    }
  };

  const uploadYml = async event => {
    const fileContent = await extractConfigFromFile(event.target);

    if (formProps.values.registrySource === ContainerRegistrySources.acr) {
      formProps.setFieldValue('acrComposeYml', fileContent);
    } else if (formProps.values.registrySource === ContainerRegistrySources.docker) {
      formProps.setFieldValue('dockerHubComposeYml', fileContent);
    } else {
      formProps.setFieldValue('privateRegistryComposeYml', fileContent);
    }
  };

  return (
    <>
      {/* NOTE(michinoy): This hidden element is needed to map the upload button to input field */}
      <input ref={ref => (uploadFileRef.current = ref)} style={{ display: 'none' }} type="file" onChange={uploadYml} />
      <ReactiveFormControl id="deployment-center-github-user" label={t('containerMultiConfigurationFile')}>
        <div>
          <Field
            id="container-privateRegistry-composeYml"
            name="privateRegistryComposeYml"
            component={DefaultButton}
            label={t('containerMultiConfigurationFile')}
            text={t('deploymentCenterChooseFile')}
            onClick={onUploadButtonClick}
          />
        </div>
      </ReactiveFormControl>
    </>
  );
};

export default DeploymentCenterContainerComposeFileUploader;
