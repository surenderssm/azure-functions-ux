import React, { useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { IDropdownOption, DropdownMenuItemType, Link, MessageBarType } from 'office-ui-fabric-react';
import { BuildProvider, ScmType } from '../../../../models/site/config';
import { Field } from 'formik';
import Dropdown from '../../../../components/form-controls/DropDown';
import { learnMoreLinkStyle } from '../../../../components/form-controls/formControl.override.styles';
import { DeploymentCenterLinks } from '../../../../utils/FwLinks';
import CustomBanner from '../../../../components/CustomBanner/CustomBanner';
import { DeploymentCenterContext } from '../DeploymentCenterContext';
import { deploymentCenterInfoBannerDiv, additionalTextFieldControl } from '../DeploymentCenter.styles';
import {
  DeploymentCenterFieldProps,
  DeploymentCenterCodeFormData,
  BuildChoiceGroupOption,
  RuntimeStackOptions,
  RuntimeStackSetting,
} from '../DeploymentCenter.types';
import { Guid } from '../../../../utils/Guid';
import ReactiveFormControl from '../../../../components/form-controls/ReactiveFormControl';
import DeploymentCenterCodeBuildCallout from './DeploymentCenterCodeBuildCallout';
import { ScenarioService } from '../../../../utils/scenario-checker/scenario.service';
import { ScenarioIds } from '../../../../utils/scenario-checker/scenario-ids';
import { SiteStateContext } from '../../../../SiteState';
import { PortalContext } from '../../../../PortalContext';
import { getRuntimeStackSetting, getTelemetryInfo } from '../utility/DeploymentCenterUtility';

const DeploymentCenterCodeSourceAndBuild: React.FC<DeploymentCenterFieldProps<DeploymentCenterCodeFormData>> = props => {
  const { formProps } = props;
  const { t } = useTranslation();
  const scenarioService = new ScenarioService(t);

  const [sourceOptions, setSourceOptions] = useState<IDropdownOption[]>([]);
  const [selectedBuild, setSelectedBuild] = useState<BuildProvider>(BuildProvider.None);
  const [selectedBuildChoice, setSelectedBuildChoice] = useState<BuildProvider>(BuildProvider.None);
  const [isCalloutVisible, setIsCalloutVisible] = useState(false);
  const [showInfoBanner, setShowInfoBanner] = useState(true);

  const deploymentCenterContext = useContext(DeploymentCenterContext);
  const siteStateContext = useContext(SiteStateContext);
  const portalContext = useContext(PortalContext);

  const toggleIsCalloutVisible = () => {
    setSelectedBuildChoice(selectedBuild);
    setIsCalloutVisible(!isCalloutVisible);
  };

  const getInProductionSlot = () => {
    return !(deploymentCenterContext.siteDescriptor && deploymentCenterContext.siteDescriptor.slot);
  };

  const closeInfoBanner = () => {
    setShowInfoBanner(false);
  };

  const getSourceOptions = async () => {
    const cdOptions = await getContinuousDeploymentOptions();
    const manualDeploymentOptions = await getManualDeploymentOptions();
    setSourceOptions([...cdOptions, ...manualDeploymentOptions]);
  };

  const getContinuousDeploymentOptions = async () => {
    const continuousDeploymentOptions: IDropdownOption[] = [];
    const checkGitHubSource = await scenarioService.checkScenarioAsync(ScenarioIds.githubSource, { site: siteStateContext.site });
    const checkBitbucketSource = await scenarioService.checkScenarioAsync(ScenarioIds.bitbucketSource, { site: siteStateContext.site });
    const checklocalGitSource = await scenarioService.checkScenarioAsync(ScenarioIds.localGitSource, { site: siteStateContext.site });
    const checkVstsKuduSource = await scenarioService.checkScenarioAsync(ScenarioIds.vstsKuduSource, { site: siteStateContext.site });

    if (checkGitHubSource.status !== 'disabled') {
      continuousDeploymentOptions.push({ key: ScmType.GitHub, text: t('deploymentCenterCodeSettingsSourceGitHub') });
    }

    if (checkBitbucketSource.status !== 'disabled') {
      continuousDeploymentOptions.push({ key: ScmType.BitbucketGit, text: t('deploymentCenterCodeSettingsSourceBitbucket') });
    }

    if (checklocalGitSource.status !== 'disabled') {
      continuousDeploymentOptions.push({ key: ScmType.LocalGit, text: t('deploymentCenterCodeSettingsSourceLocalGit') });
    }

    if (checkVstsKuduSource.status !== 'disabled') {
      continuousDeploymentOptions.push({ key: ScmType.Vso, text: t('deploymentCenterCodeSettingsSourceAzureRepos') });
    }

    return continuousDeploymentOptions.length > 0
      ? [
          {
            key: 'continuousDeploymentHeader',
            text: t('deploymentCenterCodeSettingsSourceContinuousDeploymentHeader'),
            itemType: DropdownMenuItemType.Header,
          },
          ...continuousDeploymentOptions,
          { key: 'divider_1', text: '-', itemType: DropdownMenuItemType.Divider },
        ]
      : continuousDeploymentOptions;
  };

  const getManualDeploymentOptions = async () => {
    const manualDeploymentOptions: IDropdownOption[] = [];
    const checkExternalSource = await scenarioService.checkScenarioAsync(ScenarioIds.externalSource, { site: siteStateContext.site });
    const checkOneDriveSource = await scenarioService.checkScenarioAsync(ScenarioIds.onedriveSource, { site: siteStateContext.site });
    const checkDropboxSource = await scenarioService.checkScenarioAsync(ScenarioIds.dropboxSource, { site: siteStateContext.site });

    if (checkExternalSource.status !== 'disabled') {
      manualDeploymentOptions.push({ key: ScmType.ExternalGit, text: t('deploymentCenterCodeSettingsSourceExternalGit') });
    }

    if (checkOneDriveSource.status !== 'disabled') {
      manualDeploymentOptions.push({ key: ScmType.OneDrive, text: t('deploymentCenterCodeSettingsSourceOneDrive') });
    }

    if (checkDropboxSource.status !== 'disabled') {
      manualDeploymentOptions.push({ key: ScmType.Dropbox, text: t('deploymentCenterCodeSettingsSourceDropbox') });
    }

    return manualDeploymentOptions.length > 0
      ? [
          {
            key: 'manualDeploymentHeader',
            text: t('deploymentCenterCodeSettingsSourceManualDeploymentHeader'),
            itemType: DropdownMenuItemType.Header,
          },
          ...manualDeploymentOptions,
        ]
      : [];
  };

  const updateSelectedBuild = () => {
    portalContext.log(
      getTelemetryInfo('info', 'buildProvider', 'updated', {
        buildProvider: selectedBuildChoice,
      })
    );

    setSelectedBuild(selectedBuildChoice);
    formProps.setFieldValue('buildProvider', selectedBuildChoice);
    if (selectedBuildChoice === BuildProvider.GitHubAction) {
      formProps.setFieldValue(
        'gitHubPublishProfileSecretGuid',
        Guid.newGuid()
          .toLowerCase()
          .replace(/[-]/g, '')
      );
    }
    toggleIsCalloutVisible();
  };

  const updateSelectedBuildChoiceOption = (e: any, option: BuildChoiceGroupOption) => {
    setSelectedBuildChoice(option.buildType);
  };

  useEffect(() => {
    portalContext.log(
      getTelemetryInfo('info', 'getSourceOptions', 'submit', {
        buildProvider: selectedBuildChoice,
      })
    );
    getSourceOptions();
  }, []);

  useEffect(() => {
    if (!!formProps.values.sourceProvider && formProps.values.sourceProvider !== ScmType.None) {
      setSourceBuildProvider();
    } else {
      // NOTE(michinoy): If the source provider is set to None, it means either an initial load or discard.
      // only clear the values in that case.
      clearBuildAndRepoFields();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formProps.values.sourceProvider]);

  const clearBuildAndRepoFields = () => {
    formProps.setFieldValue('buildProvider', BuildProvider.None);
    formProps.setFieldValue('org', '');
    formProps.setFieldValue('repo', '');
    formProps.setFieldValue('branch', '');
  };

  const setSourceBuildProvider = () => {
    if (formProps.values.sourceProvider === ScmType.GitHub) {
      //Note (stpelleg): Need to disable GitHub Actions for Ruby and ILB ASE as we do not support it
      if (
        (!!defaultStackAndVersion && defaultStackAndVersion.runtimeStack.toLocaleLowerCase() === RuntimeStackOptions.Ruby) ||
        deploymentCenterContext.isIlbASE
      ) {
        setSelectedBuild(BuildProvider.AppServiceBuildService);
        formProps.setFieldValue('buildProvider', BuildProvider.AppServiceBuildService);
      } else {
        setSelectedBuild(BuildProvider.GitHubAction);
        formProps.setFieldValue('buildProvider', BuildProvider.GitHubAction);
        formProps.setFieldValue(
          'gitHubPublishProfileSecretGuid',
          Guid.newGuid()
            .toLowerCase()
            .replace(/[-]/g, '')
        );
      }
    } else {
      setSelectedBuild(BuildProvider.AppServiceBuildService);
      formProps.setFieldValue('buildProvider', BuildProvider.AppServiceBuildService);
    }
  };

  const defaultStackAndVersion: RuntimeStackSetting = getRuntimeStackSetting(
    siteStateContext.isLinuxApp,
    siteStateContext.isFunctionApp,
    siteStateContext.isKubeApp,
    deploymentCenterContext.siteConfig,
    deploymentCenterContext.configMetadata,
    deploymentCenterContext.applicationSettings
  );
  const isSourceSelected = formProps.values.sourceProvider !== ScmType.None;
  const calloutOkButtonDisabled = selectedBuildChoice === selectedBuild;
  const isAzureDevOpsSupportedBuild =
    formProps.values.sourceProvider === ScmType.GitHub ||
    formProps.values.sourceProvider === ScmType.Vso ||
    formProps.values.sourceProvider === ScmType.ExternalGit;

  const getBuildDescription = () => {
    switch (formProps.values.buildProvider) {
      case BuildProvider.GitHubAction:
        return t('deploymentCenterGitHubActionsBuildDescription');
      case BuildProvider.AppServiceBuildService:
        return t('deploymentCenterKuduBuildDescription');
      case BuildProvider.Vsts:
        return t('deploymentCenterVstsBuildDescription');
    }
  };

  const getCalloutContent = () => {
    return (
      isCalloutVisible && (
        <DeploymentCenterCodeBuildCallout
          selectedBuildChoice={selectedBuildChoice}
          updateSelectedBuildChoiceOption={updateSelectedBuildChoiceOption}
          calloutOkButtonDisabled={calloutOkButtonDisabled}
          toggleIsCalloutVisible={toggleIsCalloutVisible}
          updateSelectedBuild={updateSelectedBuild}
          formProps={formProps}
          runtimeStack={defaultStackAndVersion.runtimeStack}
        />
      )
    );
  };

  return (
    <>
      {getInProductionSlot() && showInfoBanner && (
        <div className={deploymentCenterInfoBannerDiv}>
          <CustomBanner
            id="deployment-center-prod-slot-warning"
            message={t('deploymentCenterProdSlotWarning')}
            type={MessageBarType.info}
            onDismiss={closeInfoBanner}
            learnMoreLink={DeploymentCenterLinks.configureDeploymentSlots}
            learnMoreLinkAriaLabel={t('deploymentCenterProdSlotWarningLinkAriaLabel')}
          />
        </div>
      )}

      <p>
        <span id="deployment-center-settings-message">{t('deploymentCenterCodeSettingsDescription')}</span>
        <Link
          id="deployment-center-settings-learnMore"
          href={DeploymentCenterLinks.appServiceDocumentation}
          target="_blank"
          className={learnMoreLinkStyle}
          aria-labelledby="deployment-center-settings-message">
          {` ${t('learnMore')}`}
        </Link>
      </p>

      <Field
        label={t('deploymentCenterSettingsSourceLabel')}
        placeholder={t('deploymentCenterCodeSettingsSourcePlaceholder')}
        name="sourceProvider"
        component={Dropdown}
        displayInVerticalLayout={true}
        options={sourceOptions}
        required={true}
        aria-required={true}
      />

      {isSourceSelected &&
        (isAzureDevOpsSupportedBuild ? (
          <>
            <ReactiveFormControl id="deployment-center-build-provider-text" pushContentRight={true}>
              <div>
                {getBuildDescription()}
                <Link
                  key="deployment-center-change-build-provider"
                  onClick={toggleIsCalloutVisible}
                  className={additionalTextFieldControl}
                  aria-label={t('deploymentCenterChangeBuildText')}>
                  {`${t('deploymentCenterChangeBuildText')}`}
                </Link>
              </div>
            </ReactiveFormControl>
            {getCalloutContent()}
          </>
        ) : (
          <ReactiveFormControl id="deployment-center-build-provider-text" pushContentRight={true}>
            <div>{getBuildDescription()}</div>
          </ReactiveFormControl>
        ))}
    </>
  );
};

export default DeploymentCenterCodeSourceAndBuild;
