import { Injectable } from '@angular/core';
import { ContainerSample, ContainerOS, ContainerType } from '../container-settings';
import { TranslateService } from '@ngx-translate/core';
import { PortalResources } from '../../../shared/models/portal-resources';
import { Observable } from 'rxjs/Observable';

export interface IContainerSamplesService {
    getQuickstartSamples(containerOS: ContainerOS, containerType: ContainerType): Observable<ContainerSample[]>;
}
@Injectable()
export class ContainerSamplesService implements IContainerSamplesService {
    private _samples: ContainerSample[] = [];

    constructor(private _ts: TranslateService) {
        this._loadSamples();
    }

    public getQuickstartSamples(containerOS: ContainerOS, containerType: ContainerType): Observable<ContainerSample[]> {
        // TODO (michinoy): Once the API is ready, the hardcoded list can be replaced with it.
        const samples = this._samples.filter(sample => sample.containerOS === containerOS && sample.containerType === containerType);
        return Observable.of(samples);
    }

    private _loadSamples() {
        this._samples = [
            {
                name: 'sample1',
                title: this._ts.instant(PortalResources.quickstartSample1),
                configBase64Encoded: this._getSingleContainerSample1Config(),
                description: this._ts.instant(PortalResources.singleContainerSample1Description),
                containerType: 'single',
                containerOS: 'linux',
            },
            {
                name: 'sample2',
                title: this._ts.instant(PortalResources.quickstartSample2),
                configBase64Encoded: this._getSingleContainerSample2Config(),
                description: this._ts.instant(PortalResources.singleContainerSample2Description),
                containerType: 'single',
                containerOS: 'linux',
            },
            {
                name: 'sample1',
                title: this._ts.instant(PortalResources.quickstartSample1),
                configBase64Encoded: this._getDockerComposeSample1Config(),
                description: this._ts.instant(PortalResources.dockerComposeSample1Description),
                containerType: 'dockerCompose',
                containerOS: 'linux',
            },
            {
                name: 'sample2',
                title: this._ts.instant(PortalResources.quickstartSample2),
                configBase64Encoded: this._getDockerComposeSample2Config(),
                description: this._ts.instant(PortalResources.dockerComposeSample2Description),
                containerType: 'dockerCompose',
                containerOS: 'linux',
            },
            {
                name: 'sample1',
                title: this._ts.instant(PortalResources.quickstartSample1),
                configBase64Encoded: this._getKubernetesComposeSample1Config(),
                description: this._ts.instant(PortalResources.kubernetesSample1Description),
                containerType: 'kubernetes',
                containerOS: 'linux',
            },
            {
                name: 'sample1',
                title: this._ts.instant(PortalResources.quickstartSample1),
                configBase64Encoded: this._getWindowsSingleContainerSample1Config(),
                description: this._ts.instant(PortalResources.singleContainerWindowsSample1Description),
                containerType: 'single',
                containerOS: 'windows',
            },
        ];
    }

    private _getSingleContainerSample1Config() {
        return btoa('appsvcsample/flask-sample');
    }

    private _getSingleContainerSample2Config() {
        return btoa('appsvcsample/static-site');
    }

    private _getDockerComposeSample1Config() {
        return btoa(`version: "3"
            services:
                web:
                    image: "appsvcsample/asp"
                    # the source repo is at https://github.com/yiliaomsft/compose-asp-sql
                    ports:
                        - "8080:80"
                    depends_on:
                        - db
                db:
                    image: "microsoft/mssql-server-linux"
                    environment:
                        SA_PASSWORD: "Your_password123"
                        ACCEPT_EULA: "Y"`);
    }

    private _getDockerComposeSample2Config() {
        return btoa(`version: '3.1'
        services:
            wp-fpm:
                image: appsvcorg/wordpress-multi-container:0.1-fpm
                restart: always
                depends_on:
                    - redis
                volumes:
                    - \${WEBAPP_STORAGE_HOME}/site/wwwroot:/var/www/html
                    - \${WEBAPP_STORAGE_HOME}/LogFiles/php:/var/log/php
                ports:
                    - 2222:2222
                environment:
                    # use local redis
                    WP_REDIS_HOST: redis
                    # SSL ENABLE SQL
                    MYSQL_SSL_CA_PATH: '/'
            redis:
                image: redis:3-alpine
                restart: always
            nginx:
                image: appsvcorg/nginx-multi-container:0.1-wordpress-fpm
                restart: always
                depends_on:
                    - wp-fpm
                ports:
                    - 80:80
                volumes:
                    - \${WEBAPP_STORAGE_HOME}/site/wwwroot:/var/www/html
                    - \${WEBAPP_STORAGE_HOME}/LogFiles/nginx:/var/log/nginx`);
    }

    private _getKubernetesComposeSample1Config() {
        return btoa(`apiVersion: v1
            kind: Pod
            metadata:
            name: wordpress
            spec:
                containers:
                    - name: wordpress
                        image: microsoft/multicontainerwordpress
                        ports:
                            - containerPort: 80
                    - name: redis
                        image: redis:alpine`);
    }

    private _getWindowsSingleContainerSample1Config() {
        return btoa('mcr.microsoft.com/azure-app-service/samples/aspnethelloworld:latest');
    }
}
