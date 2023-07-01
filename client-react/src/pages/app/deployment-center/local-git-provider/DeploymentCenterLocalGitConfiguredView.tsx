import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';

import ReactiveFormControl from '../../../../components/form-controls/ReactiveFormControl';
import { deploymentCenterContent } from '../DeploymentCenter.styles';
import { DeploymentCenterPublishingContext } from '../DeploymentCenterPublishingContext';
import { getGitCloneUri } from '../utility/DeploymentCenterUtility';

const DeploymentCenterLocalGitConfiguredView: React.FC = () => {
  const { t } = useTranslation();
  const deploymentCenterPublishingContext = useContext(DeploymentCenterPublishingContext);
  const gitCloneUri = getGitCloneUri(deploymentCenterPublishingContext);

  return (
    <>
      <h3>{t('deploymentCenterCodeLocalGitTitle')}</h3>

      <div className={deploymentCenterContent}>
        <ReactiveFormControl
          id="deployment-center-localgit-clone-uri"
          label={t('deploymentCenterCodeLocalGitCloneUri')}
          copyValue={gitCloneUri}>
          <div>{gitCloneUri ? gitCloneUri : t('deploymentCenterCodeLocalGitFetchCloneUriError')}</div>
        </ReactiveFormControl>
      </div>
    </>
  );
};

export default DeploymentCenterLocalGitConfiguredView;
