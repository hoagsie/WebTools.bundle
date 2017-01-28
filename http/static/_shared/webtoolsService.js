﻿angular.module('webtools').service('webtoolsService', ['$http', '$window', '$log', 'webtoolsModel', function ($http, $window, $log, webtoolsModel) {
    var self = this;
    //Private
    var anyNewVersion = function (currentVersion, latestVersion) {
        currentVersion = currentVersion.split(" ")[0].toString().split('.');
        latestVersion = latestVersion.split(" ")[0].toString().split('.');
        for (var i = 0; i < (Math.max(currentVersion.length, latestVersion.length)) ; i++) {
            if (!currentVersion[i]) currentVersion[i] = 0;
            if (!latestVersion[i]) latestVersion[i] = 0;
            if (Number(currentVersion[i]) < Number(latestVersion[i])) {
                return true;
            }
            if (Number(currentVersion[i]) > Number(latestVersion[i])) {
                return false;
            }
        }
        return false;
    }
    var checkIsNewVersionAvailable = function (callback) {
        webtoolsModel.globalLoading = true;
        $http.get(webtoolsModel.apiUrl, {
            params: {
                "module": "git",
                "function": "getReleaseInfo",
                "url": webtoolsModel.repoUrl,
                "version": "latest",
            }
        }).then(function (resp) {
            if (resp.data.published_at && anyNewVersion(webtoolsModel.version, resp.data.tag_name)) {
                webtoolsModel.isNewVersionAvailable = true;
            }
            if (callback) callback(resp.data);
            webtoolsModel.globalLoading = false;
        }, function (errroResp) {
            self.log("var checkIsNewVersionAvailable - Could not check for new version", "Core", true);
            webtoolsModel.globalLoading = false;
        });
    }

    //Public
    this.loadWebToolsVersion = function (callback) {
        webtoolsModel.globalLoading = true;
        $http.get("/version")
        .then(function (resp) {
            webtoolsModel.version = resp.data.version;
            webtoolsModel.versionFormated = "WebTools - v" + resp.data.version;
            webtoolsModel.globalLoading = false;
            checkIsNewVersionAvailable();
            if (callback) callback(resp.data);
        }), function (errroResp) {
            self.log("webtoolsService.loadWebToolsVersion -  - Could not resolve WebToolVersion", "Core", true);
            webtoolsModel.globalLoading = false;
        };
    };
    this.log = function (text, location, error) {
        if (!location) location = "Empty";

        var text = location + " - " + text;  
        $http({
            method: "POST",
            url: webtoolsModel.apiUrl + "?module=logs&function=entry&text=" + text,
        }).then(function (resp) {
            if (error) $log.error("Error occurred! " + text);
        }), function (errorResp) {
            $log.error("webtoolsService.log - LOGGING NOT AVAILABLE! " + text + " " + location + " - RESPONSE: " + errorResp);
        };
    };

}]);