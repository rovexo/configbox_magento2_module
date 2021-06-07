<?php

namespace Rovexo\Configbox\Observer;

use Magento\Framework\Event\Observer;
use Magento\Framework\Event\ObserverInterface;
use Magento\Framework\Registry;
use Rovexo\Configbox\Model\Prepare;
use KenedoModel;

/**
 * Class CbPrice
 *
 * @category Rovexo
 * @package  Rovexo/Configbox
 * @author   Rovexo SIA <office@rovexo.com>
 * @license  https://www.configbox.at/eula ConfigBox License
 * @link     https://www.configbox.at
 */
class CbPrice implements ObserverInterface
{
    /**
     * @var Registry
     */
    protected $_registry;

    /**
     * @var Prepare
     */
    protected $_prepare;

    /**
     * @param Registry $registry
     * @param Prepare $prepare
     */
    public function __construct(
        Registry $registry,
        Prepare $prepare
    ) {
        $this->_registry = $registry;
        $this->_prepare = $prepare;
    }

    /**
     * Implementation of execute() method
     *
     * @param Observer $observer Observer object
     *
     * @return CbPrice
     */
    public function execute(Observer $observer)
    {
        $priceConfigObj = $observer->getData('configObj')->getConfig();

        /** @var \Magento\Catalog\Model\Product $product */
        $product = $this->_registry->registry('current_product');

        $cbOption = '';
        foreach ($product->getOptions() as $option) {
            if ($option->getType() == 'configbox') {
                $cbOption = $option;
                break;
            }
        }

        if ($cbOption == '') {
            return $this;
        }

        if ($product->hasConfigureMode() && ($product->getConfigureMode() === true)) {

            $preConfiguredValues = $product->getPreconfiguredValues();
            $preConfiguredOptions = $preConfiguredValues->getOptions();
            $cbOptionData = json_decode($preConfiguredOptions[$cbOption->getOptionId()], true);

            $cbPriceData = array(
                'prices' => array(
                    'oldPrice' => array(
                        'amount' => $cbOptionData['totalGross'],
                        'adjustments' => array(),
                    ),
                    'basePrice' => array(
                        'amount' => $cbOptionData['totalNet'],
                    ),
                    'finalPrice' => array(
                        'amount' => $cbOptionData['totalGross'],
                    )
                ),
                'type' => $cbOption->getPriceType(),
                'name' => $cbOption->getTitle(),
            );
        } else {
            $mageProductId = $product->getId();
            $cbProdId = $this->_prepare->getCbProductId($mageProductId);

            $pageModel = KenedoModel::getModel('ConfigboxModelConfiguratorpage');
            $cartModel = KenedoModel::getModel('ConfigboxModelCart');
            $positionModel = KenedoModel::getModel('ConfigboxModelCartPosition');

            $taxRate = $this->_prepare->getTaxRate($product);
            \KSession::set('cbtaxrate', $taxRate);

            $pageModel->ensureProperCartEnvironment($cbProdId);

            $cartId = $cartModel->getSessionCartId();
            $positionId = $positionModel->createPosition($cartId, $cbProdId);

            $position = $positionModel->getPosition($positionId);
            $positionDetails = $positionModel->getPositionDetails($position);

            $cbPriceData = array(
                'prices' => array(
                    'oldPrice' => array(
                        'amount' => $positionDetails->totalUnreducedGross,
                        'adjustments' => array(),
                    ),
                    'basePrice' => array(
                        'amount' => $positionDetails->totalUnreducedNet,
                    ),
                    'finalPrice' => array(
                        'amount' => $positionDetails->totalUnreducedGross,
                    )
                ),
                'type' => $cbOption->getPriceType(),
                'name' => $cbOption->getTitle(),
            );
        }

        $priceConfigObj[$cbOption->getOptionId()] = $cbPriceData;
        $observer->getData('configObj')->setConfig($priceConfigObj);

        return $this;
    }
}
