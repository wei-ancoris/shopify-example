import React from 'react';
import Router from 'next/router';

import {
    Banner,
    Card,
    DisplayText,
    Form,
    FormLayout,
    Frame,
    Layout,
    Page,
    PageActions,
    Toast,
    Button,
    Stack,
} from '@shopify/polaris';
import store from 'store-js';
import gql from 'graphql-tag';
import { Mutation } from 'react-apollo';
import { base64Encode, downloadImage } from '../utils';
import { Oval } from "react-loader-spinner";

const UPDATE_IMAGE = gql`
  mutation productImageUpdate($image: ImageInput!, $productId: ID!) {
    productImageUpdate(image: $image, productId: $productId) {
      image {
        id
        src
        altText
      }
      userErrors {
        field
        message
      }
    }
  }
`;

class EditProduct extends React.Component {
    state = {
        productId: '',
        imageId: '',
        src: '',
        altText: '',
        showToast: false,
        item: null,
        processSrc: '',
        loading: false,
    };

    componentDidMount() {
        this.itemToBeConsumed()
    }

    render() {
        const { name, productId, imageId, src, altText, item, processSrc, loading } = this.state;

        return (
            <Mutation
                mutation={UPDATE_IMAGE}
            >
                {(handleSubmit, {error, data}) => {
                    const showError = error && (
                        <Banner status="critical">{error.message}</Banner>
                    );
                    const showToast = data && data.productVariantUpdate && (
                        <Toast
                            content="Sucessfully updated"
                            onDismiss={() => this.setState({ showToast: false })}
                        />
                    );

                    const thumbnails = () => {
                        if (item && item.images) {
                            //console.log(item.images);
                            console.log( item.images.edges);
                            const thumbs = item.images.edges.map((edge, index) => <img
                                key={index}
                                src={edge.node.originalSrc}
                                alt={edge.node.altText}
                                width={120}
                                height={120}
                                onClick={() => {
                                    this.setState({
                                        productId: item.id,
                                        imageId: edge.node.id,
                                        altText: edge.node.altText,
                                        processSrc: edge.node.originalSrc,
                                        src: edge.node.originalSrc
                                    });
                                }}
                            />)
                            return thumbs;
                        }
                        return <></>;
                    };

                    const isProcessDisabled = () => {
                        return processSrc === '' || processSrc.includes('google');
                    }

                    const spinner = () => {
                        return loading ? 
                        <Oval
                            color="#008060"
                            height={24}
                            width={24}
                        /> : <></>;
                    }

                    

                    return (
                        <Frame>
                            <Page>
                                <Layout>
                                    {showToast}
                                    <Layout.Section>
                                        {showError}
                                    </Layout.Section>
                                    <Layout.Section>
                                        <DisplayText size="large">{name}</DisplayText>
                                        <Form>
                                            <Card sectioned>
                                                <FormLayout>
                                                    <FormLayout.Group>
                                                        {thumbnails()}
                                                    </FormLayout.Group>
                                                    <p>
                                                        {(processSrc !== '') ? <img width="100%" src={processSrc}/> : <></>}
                                                    </p>
                                                    <p>
                                                        <ol>
                                                            <li>Select a image</li>
                                                            <li>Click "Download" button if you wish to make a backup the original image (optional)</li>
                                                            <li>Click "Preview" button to process image and preview the change</li>
                                                            <li>Click "Save" button to save the change of the current image to product</li>
                                                        </ol>
                                                    </p>
                                                    <Stack>
                                                        <Stack.Item>
                                                            <Button onClick={this.handleAutoLevel} disabled={isProcessDisabled()}>Preview</Button>
                                                        </Stack.Item>
                                                        <Stack.Item>
                                                            <Button onClick={this.handleDownload} disabled={processSrc === ''}>Download</Button>
                                                        </Stack.Item>
                                                        <Stack.Item>
                                                            {spinner()}
                                                        </Stack.Item>
                                                    </Stack>
                                                </FormLayout>
                                            </Card>
                                            <PageActions
                                                primaryAction={[
                                                    {
                                                        content: 'Save',
                                                        onAction: async () => {
                                                            if (processSrc.includes('google')) {
                                                                try {
                                                                    this.setState({loading: true});
                                                                    const image = {
                                                                        id: imageId,
                                                                        src: processSrc,
                                                                        altText: altText || ''
                                                                    };
                                                                    await handleSubmit({
                                                                        variables: { 
                                                                            image: image,
                                                                            productId: productId,
                                                                        },
                                                                    });
                                                                    for(let i = 0; i < item.images.edges.length; i++) {
                                                                        if (item.images.edges[i].node.id === imageId) {
                                                                            item.images.edges[i].node.originalSrc = processSrc;
                                                                            this.setState({item: item});
                                                                            store.set('item', item);
                                                                            window.location.reload();
                                                                            break;
                                                                        }
                                                                    }
                                                                } finally {
                                                                    this.setState({loading: false});
                                                                }   
                                                            }
                                                        }
                                                    }
                                                ]}
                                                secondaryActions={[
                                                    {
                                                        content: 'Back',
                                                        onAction: () => {
                                                            Router.back();
                                                        }
                                                    }
                                                ]}
                                            />
                                        </Form>
                                    </Layout.Section>
                                </Layout>
                            </Page>
                        </Frame>
                    );
                }}
            </Mutation>
        );
    }

    handleChange = (field) => {
        return (value) => this.setState({ [field]: value });
    };

    handleDownload = () => {
        downloadImage(this.state.processSrc, 'download.jpg');
    }

    handleAutoLevel = async () => {
        try {
            this.setState({loading: true});
            const { processSrc } = this.state;
            const response = await fetch(`/api/process-image/${encodeURIComponent(base64Encode(processSrc))}`,
            {
                headers: {'Content-Type': 'application/json'}
            });
            const responseJson = await response.json();
            this.setState({processSrc: responseJson.image});
        } finally {
            this.setState({loading: false});
        }
        
    }

    itemToBeConsumed = () => {
        const item = store.get('item');
        this.setState({ productId: item.id, item: item});
    };
}

export default EditProduct;