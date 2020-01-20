<?php

namespace Rovexo\Configbox\Plugin;

use ConfigboxConfiguration;
use ConfigboxQuestion;
use KenedoModel;
use Magento\Catalog\Model\Product;
use Magento\Catalog\Model\Product\Option;
use Magento\Catalog\Model\ProductFactory;
use Magento\Framework\DataObject;
use Magento\Store\Model\StoreManagerInterface;
use Magento\Wishlist\Model\Wishlist as MagentoWishlist;
use Rovexo\Configbox\Model\Prepare;

/**
 * Class Wishlist
 *
 * @category Rovexo
 * @package  Rovexo/Configbox
 * @author   Rovexo SIA <office@rovexo.com>
 * @license  https://www.configbox.at/eula ConfigBox License
 * @link     https://www.configbox.at
 */
class Wishlist
{
    protected $storeManager;

    protected $productFactory;

    protected $prepare;

    /**
     * Wishlist constructor.
     *
     * @param StoreManagerInterface $storeManager   Store Manager object
     * @param ProductFactory        $productFactory Product factory object
     * @param Prepare               $prepare        Prepare object
     */
    public function __construct(
        StoreManagerInterface $storeManager,
        ProductFactory $productFactory,
        Prepare $prepare
    ) {
        $this->storeManager = $storeManager;
        $this->productFactory = $productFactory;
        $this->prepare = $prepare;
    }

    /**
    * Plugin before adding new item
    *
    * @param MagentoWishlist              $subject        Core Wishlist object
    * @param Product                      $product        Product object
    * @param DataObject|array|string|null $request        Request object
    * @param bool                         $forciblySetQty Force qty or not
    *
    * @return mixed
    */
    public function beforeAddNewItem(
        MagentoWishlist $subject,
        $product,
        $request = null,
        $forciblySetQty = false
    ) {
        if ($product instanceof Product) {
            $productId = $product->getId();
            // Maybe force some store by wishlist internal properties
            $storeId = $product->hasWishlistStoreId() ?
                $product->getWishlistStoreId() : $product->getStoreId();
        } else {
            $productId = (int) $product;
            if ($request->getStoreId()) {
                $storeId = $request->getStoreId();
            } else {
                $storeId = $this->storeManager->getStore()->getId();
            }
        }

        //TODO: Replace deprecated code
        $product = $this->productFactory->create()
            ->setStoreId($storeId)
            ->load($productId);

        $options = $product->getOptions();
        $requestData = $request->getData();

        /**
         * Array of Option objects
         *
         * @var Option[] $options
         */
        foreach ($options as $option) {
            if ($option->getType() == 'configbox') {
                $model = KenedoModel::getModel('ConfigboxModelCartposition');
                $positionId = $model->getId();

                if (!$positionId) {
                    $cartModel = KenedoModel::getModel('ConfigboxModelCart');
                    $cartId = $cartModel->getSessionCartId();
                    if (!$cartId) {
                        $cartId = $cartModel->createCart();
                    }

                    $cbProductId = $this->prepare->getCbProductId($productId);
                    $positionId = $model->createPosition($cartId, $cbProductId);
                }

                $configuration = ConfigboxConfiguration::getInstance($positionId);

                // Now store selections in DB
                $configuration->storeSelectionsInDb();

                $positionModel = KenedoModel::getModel('ConfigboxModelCartposition');
                $positionModel->setId($positionId, false);
                $positionDetails = $positionModel->getPositionDetails();

                // Prepare the SKU
                $skus = [];
                $configurationSelections = $configuration->getSelections();
                foreach ($configurationSelections as $questionId => $selection) {
                    if (ConfigboxQuestion::questionExists($questionId) == false) {
                        continue;
                    }

                    $question = ConfigboxQuestion::getQuestion($questionId);

                    if (!empty($question->answers)
                        && $question->answers[$selection]->sku
                    ) {
                        $skus[] = $question->answers[$selection]->sku;
                    }
                }

                // Prepare the formatted option value
                $texts = [];
                $configurationSelections = $configuration->getSelections();
                foreach ($configurationSelections as $questionId => $selection) {
                    $question = ConfigboxQuestion::getQuestion($questionId);
                    $texts[] = $question->title . ': ' .
                        $question->getOutputValue($selection);
                }
                $formattedOptionValue = implode(', ', $texts);

                $configInfo = [
                    'position_id' => $positionId,
                    'mage_prod_id' => $product->getId(),
                    'prod_id' => $configuration->getProductId(),
                    'selections' => $configuration->getSelections(),
                    'totalNet' => $positionDetails->totalUnreducedNet,
                    'totalGross' => $positionDetails->totalUnreducedGross,
                    'skus' => $skus,
                    'formattedOptionValue' => $formattedOptionValue,
                ];

                $requestData['options'][$option->getId()] = json_encode($configInfo);

                $request->setData($requestData);

                $model->editPosition($positionId, array('finished'=>1));
            }
        }

        return [$product, $request, $forciblySetQty];
    }
}
