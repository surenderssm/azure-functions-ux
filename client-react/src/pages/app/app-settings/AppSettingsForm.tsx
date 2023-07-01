import React, { useContext, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { style } from 'typestyle';

import { IPivotItemProps, Pivot, PivotItem } from '@fluentui/react';

import { ThemeContext } from '../../../ThemeContext';
import { isWorkflowApp } from '../../../utils/arm-utils';
import { OverflowBehavior } from '../../../utils/CommonConstants';
import { ScenarioService } from '../../../utils/scenario-checker/scenario.service';
import { ScenarioIds } from '../../../utils/scenario-checker/scenario-ids';

import ApplicationSettingsPivot, { applicationSettingsDirty } from './Sections/ApplicationSettingsPivot';
import CustomTabRenderer from './Sections/CustomTabRenderer';
import DefaultDocumentsPivot, { defaultDocumentsDirty, defaultDocumentsError } from './Sections/DefaultDocumentsPivot';
import { errorPagesDirty } from './Sections/ErrorPage';
import ErrorPagePivot from './Sections/ErrorPage';
import FunctionRuntimeSettingsPivot, { functionRuntimeSettingsDirty } from './Sections/FunctionRuntimeSettingsPivot';
import GeneralSettings, { generalSettingsDirty, generalSettingsError } from './Sections/GeneralSettings';
import PathMappingsPivot, { pathMappingsDirty } from './Sections/PathMappingsPivot';
import { pivotWrapper } from './AppSettings.styles';
import { AppSettingsFormProps, AppSettingsTabs } from './AppSettings.types';
import { SiteContext } from './Contexts';

export const settingsWrapper = style({
  padding: '5px 20px 5px 0px',
});

const AppSettingsForm: React.FC<AppSettingsFormProps> = props => {
  const theme = useContext(ThemeContext);
  const { values, initialValues, tab, errors } = props;
  const site = useContext(SiteContext);

  const { t } = useTranslation();
  const scenarioCheckerRef = useRef(new ScenarioService(t));
  const scenarioChecker = scenarioCheckerRef.current!;

  const generalSettingsDirtyCheck = () => {
    return generalSettingsDirty(values, initialValues);
  };

  const applicationSettingsDirtyCheck = () => {
    return applicationSettingsDirty(values, initialValues);
  };

  const functionRuntimeSettingsDirtyCheck = () => {
    return functionRuntimeSettingsDirty(values, initialValues);
  };

  const errorPagesDirtyCheck = () => {
    return errorPagesDirty(values, initialValues);
  };

  const pathMappingsDirtyCheck = () => {
    return pathMappingsDirty(values, initialValues);
  };

  const defaultDocumentsDirtyCheck = () => {
    return defaultDocumentsDirty(values, initialValues);
  };

  const defaultDocumentsErrorCheck = () => {
    return defaultDocumentsError(errors);
  };

  const generalSettingsErrorCheck = () => {
    return generalSettingsError(errors);
  };

  const dirtyLabel = t('modifiedTag');
  const enableDefaultDocuments = scenarioChecker.checkScenario(ScenarioIds.defaultDocumentsSupported, { site }).status !== 'disabled';
  const enablePathMappings = scenarioChecker.checkScenario(ScenarioIds.virtualDirectoriesSupported, { site }).status !== 'disabled';
  const enableAzureStorageMount = scenarioChecker.checkScenario(ScenarioIds.azureStorageMount, { site }).status === 'enabled';
  const showGeneralSettings = scenarioChecker.checkScenario(ScenarioIds.showGeneralSettings, { site }).status !== 'disabled';
  const showFunctionRuntimeSettings = scenarioChecker.checkScenario(ScenarioIds.showFunctionRuntimeSettings, { site }).status === 'enabled';
  const enableCustomErrorPages = scenarioChecker.checkScenario(ScenarioIds.enableCustomErrorPages, { site }).status !== 'disabled';

  return (
    <Pivot getTabId={getPivotTabId} defaultSelectedKey={tab} overflowBehavior={OverflowBehavior.menu}>
      <PivotItem
        className={pivotWrapper}
        onRenderItemLink={(link: IPivotItemProps, defaultRenderer: (link: IPivotItemProps) => JSX.Element) =>
          CustomTabRenderer(link, defaultRenderer, theme, applicationSettingsDirtyCheck, dirtyLabel)
        }
        itemKey={AppSettingsTabs.applicationSettings}
        headerText={t('applicationSettings')}>
        <ApplicationSettingsPivot {...props} />
      </PivotItem>

      {showFunctionRuntimeSettings ? (
        <PivotItem
          className={pivotWrapper}
          onRenderItemLink={(link: IPivotItemProps, defaultRenderer: (link: IPivotItemProps) => JSX.Element) =>
            CustomTabRenderer(link, defaultRenderer, theme, functionRuntimeSettingsDirtyCheck, dirtyLabel)
          }
          itemKey={AppSettingsTabs.functionRuntimeSettings}
          headerText={isWorkflowApp(site) ? t('workflowRuntimeSettings') : t('functionRuntimeSettings')}>
          <FunctionRuntimeSettingsPivot {...props} />
        </PivotItem>
      ) : null}

      {showGeneralSettings ? (
        <PivotItem
          className={pivotWrapper}
          onRenderItemLink={(link: IPivotItemProps, defaultRenderer: (link: IPivotItemProps) => JSX.Element) =>
            CustomTabRenderer(link, defaultRenderer, theme, generalSettingsDirtyCheck, dirtyLabel, generalSettingsErrorCheck)
          }
          itemKey={AppSettingsTabs.generalSettings}
          headerText={t('generalSettings')}>
          <GeneralSettings {...props} />
        </PivotItem>
      ) : null}

      {enableDefaultDocuments ? (
        <PivotItem
          className={pivotWrapper}
          onRenderItemLink={(link: IPivotItemProps, defaultRenderer: (link: IPivotItemProps) => JSX.Element) =>
            CustomTabRenderer(link, defaultRenderer, theme, defaultDocumentsDirtyCheck, dirtyLabel, defaultDocumentsErrorCheck)
          }
          itemKey={AppSettingsTabs.defaultDocuments}
          headerText={t('defaultDocuments')}>
          <DefaultDocumentsPivot {...props} />
        </PivotItem>
      ) : null}

      {enablePathMappings || enableAzureStorageMount ? (
        <PivotItem
          className={pivotWrapper}
          onRenderItemLink={(link: IPivotItemProps, defaultRenderer: (link: IPivotItemProps) => JSX.Element) =>
            CustomTabRenderer(link, defaultRenderer, theme, pathMappingsDirtyCheck, dirtyLabel)
          }
          itemKey={AppSettingsTabs.pathMappings}
          headerText={t('pathMappings')}>
          <PathMappingsPivot enableAzureStorageMount={enableAzureStorageMount} enablePathMappings={enablePathMappings} {...props} />
        </PivotItem>
      ) : null}

      {enableCustomErrorPages ? (
        <PivotItem
          className={pivotWrapper}
          onRenderItemLink={(link: IPivotItemProps, defaultRenderer: (link: IPivotItemProps) => JSX.Element) =>
            CustomTabRenderer(link, defaultRenderer, theme, errorPagesDirtyCheck, dirtyLabel)
          }
          itemKey={AppSettingsTabs.customErrorPage}
          headerText={t('customErrorPage')}>
          <ErrorPagePivot {...props} />
        </PivotItem>
      ) : null}
    </Pivot>
  );
};

const getPivotTabId = (itemKey: string) => {
  switch (itemKey) {
    case AppSettingsTabs.generalSettings:
      return 'app-settings-general-settings-tab';
    case AppSettingsTabs.pathMappings:
      return 'app-settings-path-mappings-tab';
    case AppSettingsTabs.defaultDocuments:
      return 'app-settings-default-documents-tab';
    case AppSettingsTabs.applicationSettings:
      return 'app-settings-application-settings-tab';
    case AppSettingsTabs.functionRuntimeSettings:
      return 'app-settings-function-runtime-settings-tab';
    case AppSettingsTabs.customErrorPage:
      return 'app-settings-custom-error-pages-tab';
  }
  return '';
};

export default AppSettingsForm;
