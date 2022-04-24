import React from 'react';
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
    TextField,
    Toast,
    Button,
    Thumbnail,
} from '@shopify/polaris';
import store from 'store-js';
import gql from 'graphql-tag';
import { Mutation } from 'react-apollo';

const UPDATE_PRICE = gql`
  mutation productVariantUpdate($input: ProductVariantInput!) {
    productVariantUpdate(input: $input) {
      product {
        title
      }
      productVariant {
        id
        price
      }
    }
  }
`;

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
        discount: '',
        price: '',
        variantId: '',
        showToast: false,
        item: null,
        processSrc: ''
    };

    componentDidMount() {
        this.setState({ discount: this.itemToBeConsumed() });
    }

    render() {
        const { name, price, discount, variantId, item, processSrc } = this.state;

        return (
            <Mutation
                mutation={UPDATE_PRICE}
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
                            console.log(item.images);
                            const thumbs = item.images.edges.map((edge, index) => <img
                                key={index}
                                src={edge.node.originalSrc}
                                alt={edge.node.altText}
                                width={120}
                                height={120}
                                onClick={() => {
                                    console.log(edge.node.originalSrc);
                                    this.setState({processSrc: edge.node.originalSrc})
                                }}
                            />)
                            return thumbs;
                        }
                        return <></>;
                    };

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
                                                    <Button onClick={this.handleAutoLevel}>AutoLevel Image</Button>
                                                </FormLayout>
                                            </Card>
                                            <PageActions
                                                primaryAction={[
                                                    {
                                                        content: 'Save',
                                                        onAction: () => {
                                                            const productVariableInput = {
                                                                id: variantId,
                                                                price: discount,
                                                            };
                                                            handleSubmit({
                                                                variables: { input: productVariableInput },
                                                            });
                                                        }
                                                    }
                                                ]}
                                                secondaryActions={[
                                                    {
                                                        content: 'Remove discount'
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

    handleAutoLevel = () => {
        const { processSrc } = this.state;
        console.log(processSrc);
    }

    itemToBeConsumed = () => {
        const item = store.get('item');
        const price = item.variants.edges[0].node.price;
        const variantId = item.variants.edges[0].node.id;
        const discounter = price * 0.1;
        this.setState({ price, variantId });
        this.setState({item: item});
        return (price - discounter).toFixed(2);
    };
}

export default EditProduct;