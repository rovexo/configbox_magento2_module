<?php

namespace Rovexo\Configbox\Plugin;

use ConfigboxConfiguration;
use ConfigboxQuestion;
use Exception;
use KenedoModel;
use Magento\Catalog\Model\Product;
use Magento\Catalog\Model\Product\Type\AbstractType;
use Rovexo\Configbox\Model\Prepare;
use Rovexo\Configbox\Plugin\Catalog\Product\Option;

/**
 * Class Quote
 *
 * @category Rovexo
 * @package  Rovexo/Configbox
 * @author   Rovexo SIA <office@rovexo.com>
 * @license  https://www.configbox.at/eula ConfigBox License
 * @link     https://www.configbox.at
 */
class Quote
{
    protected $_prepare;

    /**
     * Quote constructor.
     *
     * @param Prepare $prepare Prepare object
     */
    public function __construct(
        Prepare $prepare
    ) {
        $this->_prepare = $prepare;
    }

    /**
     * Plugin before adding product
     *
     * @param \Magento\Quote\Model\Quote $subject     Core Quote object
     * @param Product                    $product     Product object
     * @param null                       $request     Request object
     * @param string                     $processMode Process mode
     *
     * @throws Exception
     *
     * @return void
     */
    public function beforeAddProduct(
        \Magento\Quote\Model\Quote $subject,
        Product $product,
        $request = null,
        $processMode = AbstractType::PROCESS_MODE_FULL
    ) {
        $productId = $product->getId();
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

                    $cbProductId = $this->_prepare->getCbProductId($productId);
                    $positionId = $model->createPosition($cartId, $cbProductId);
                }

                $configuration = ConfigboxConfiguration::getInstance($positionId);

                // Now store selections in DB
                $configuration->storeSelectionsInDb();

                $positionModel = KenedoModel::getModel('ConfigboxModelCartposition');
                $positionModel->setId($positionId, false);
                $positionDetails = $positionModel->getPositionDetails();

                // Prepare the SKU
                $skus = array();
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
                $texts = array();
                $configurationSelections = $configuration->getSelections();
                foreach ($configurationSelections as $questionId => $selection) {
                    $question = ConfigboxQuestion::getQuestion($questionId);
                    $texts[] = $question->title . ': ' .$question->getOutputValue($selection);
                }

                $formattedOptionValue = implode(', ', $texts);

                $configInfo = array(
                    'position_id' => $positionId,
                    'mage_prod_id' => $product->getId(),
                    'prod_id' => $configuration->getProductId(),
                    'selections' => $configuration->getSelections(),
                    'totalNet' => $positionDetails->totalUnreducedNet,
                    'totalGross' => $positionDetails->totalUnreducedGross,
                    'skus' => $skus,
                    'formattedOptionValue' => $formattedOptionValue,
                );

                $requestData['options'][$option->getId()] = json_encode($configInfo);

                $request->setData($requestData);

                $model->editPosition($positionId, array('finished'=>1));
            }
        }
    }
}
