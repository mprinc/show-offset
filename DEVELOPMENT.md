# Build

```sh
tsc
```

# Launch:

```json
        {
            "name": "Position Extension",
            "type": "extensionHost",
            "request": "launch",
            "runtimeExecutable": "${execPath}",
            "args": [
                "--extensionDevelopmentPath=${workspaceFolder}/../vsc/show-offset"
            ],
            "outFiles": [
                "${workspaceFolder}/../vsc/show-offset/dist/**/*.js"
            ],
            "preLaunchTask": "npm: watch"
		},
```
