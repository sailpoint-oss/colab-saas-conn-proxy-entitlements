[![Discourse Topics][discourse-shield]][discourse-url]
[![Issues][issues-shield]][issues-url]
[![Latest Releases][release-shield]][release-url]
[![Contributor Shield][contributor-shield]][contributors-url]

[discourse-shield]:https://img.shields.io/discourse/topics?label=Discuss%20This%20Tool&server=https%3A%2F%2Fdeveloper.sailpoint.com%2Fdiscuss
[discourse-url]:https://developer.sailpoint.com/discuss/tag/workflows
[issues-shield]:https://img.shields.io/github/issues/sailpoint-oss/repo-template?label=Issues
[issues-url]:https://github.com/sailpoint-oss/repo-template/issues
[release-shield]: https://img.shields.io/github/v/release/sailpoint-oss/repo-template?label=Current%20Release
[release-url]:https://github.com/sailpoint-oss/repo-template/releases
[contributor-shield]:https://img.shields.io/github/contributors/sailpoint-oss/repo-template?label=Contributors
[contributors-url]:https://github.com/sailpoint-oss/repo-template/graphs/contributors

# SailPoint Proxy Entitlements Connector

This connector enables the management of proxy entitlements in SailPoint Identity Security Cloud (ISC). Proxy entitlements are special entitlements that, when assigned, trigger an access request for the original entitlement they represent. This is particularly useful in scenarios where roles are automatically assigned but you want certain entitlements within those roles to be subject to approval workflows.

## Use Cases

Proxy entitlements are valuable in scenarios such as:

-   Roles that are automatically assigned but contain sensitive entitlements that should require approval
-   Ensuring proper access review and approval for privileged access, even when part of an automated role assignment
-   Maintaining separation of duties by requiring explicit approval for certain entitlements within automatically assigned roles

For example, if you have a role that is automatically assigned to new employees but contains sensitive entitlements, you can replace those sensitive entitlements with proxy entitlements. When the role is assigned, instead of automatically granting the sensitive access, it will trigger an access request that must be approved through your normal approval workflows.

## Features

-   Test connection to Identity Security Cloud
-   Create and update accounts
-   List entitlements
-   Configure proxy entitlements with customizable search queries
-   Make entitlements requestable
-   Debug logging support

## Prerequisites

-   Node.js (LTS version recommended)
-   npm (comes with Node.js)
-   SailPoint Identity Security Cloud tenant
-   Personal Access Token (PAT) with appropriate permissions
-   SailPoint Connector SDK (SPCX) CLI tool

## Installation

1.  Clone this repository

    ```bash
    git clone <repo url>
    ```

2.  Install dependencies:

    ```bash
    npm install
    ```

3.  Package the connector for deployment:

    ```bash
    npm run pack-zip
    ```

Note: This connector uses the SaaS Connectivity framework, which runs directly on the Identity Security Cloud platform. Unlike traditional VA-based connectors, it does not require a Virtual Appliance for operation.

## Configuration

The connector requires the following configuration parameters:

### Connection Details

-   **Identity Security Cloud API URL**: Your ISC tenant's API URL
-   **Personal Access Token ID**: Your PAT ID
-   **Personal Access Token secret**: Your PAT secret

### Proxy Entitlements Configuration

-   **Entitlement Search Query**: Query to filter entitlements (default: "privileged:true")
-   **Request Comment**: Comment to be added to entitlement requests
-   **Make Source Entitlements Requestable**: Option to make entitlements requestable if not already

![Configuration Example](assets/images/Configuration%20example.jpg)
_Figure 1: Example configuration setup for the Proxy Entitlements connector_

## Development

### Available Scripts

-   `npm run build`: Build the connector
-   `npm run dev`: Run the connector in development mode
-   `npm run debug`: Run the connector in debug mode
-   `npm run prettier`: Format code using Prettier
-   `npm run pack-zip`: Package the connector for deployment

### Project Structure

-   `src/`: Source code directory
-   `dist/`: Compiled output directory
-   `connector-spec.json`: Connector specification and configuration
-   `package.json`: Project dependencies and scripts

## Dependencies

-   @sailpoint/connector-sdk: ^1.1.24
-   sailpoint-api-client: ^1.6.1

## Development Dependencies

-   @vercel/ncc: ^0.34.0
-   prettier: ^2.3.2
-   typescript: ^5.7.2
-   typescript-eslint: ^8.2.0

[New to the CoLab? Click here »](https://developer.sailpoint.com/discuss/t/about-the-sailpoint-developer-community-colab/11230)

<!-- CONTRIBUTING -->
## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag `enhancement`.
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<!-- LICENSE -->
## License

Distributed under the MIT License. See `LICENSE.txt` for more information.

<!-- CONTACT -->
## Discuss
[Click Here](https://developer.sailpoint.com/dicuss/tag/{tagName}) to discuss this tool with other users.
