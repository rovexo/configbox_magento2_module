<?php
namespace Rovexo\Configbox\Model;

use Exception;
use Magento\Framework\Message\ManagerInterface;
use Psr\Log\LoggerInterface;
use Rovexo\Configbox\Model\ResourceModel\ProductMapper\CollectionFactory;

/**
 * Class MapCbProduct
 *
 * @category Rovexo
 * @package  Rovexo/Configbox
 * @author   Rovexo SIA <office@rovexo.com>
 * @license  https://www.configbox.at/eula ConfigBox License
 * @link     https://www.configbox.at
 */
class MapCbProduct
{

    protected $productMapperFactory;

    protected $collectionFactory;

    protected $messageManager;

    protected $logger;

    /**
     * MapCbProduct constructor.
     *
     * @param ProductMapperFactory $productMapper     Product Mapper factory
     * @param CollectionFactory    $collectionFactory Collection factory
     * @param ManagerInterface     $messageManager    Message manager object
     * @param LoggerInterface      $logger            Logger object
     */
    public function __construct(
        ProductMapperFactory $productMapper,
        CollectionFactory $collectionFactory,
        ManagerInterface $messageManager,
        LoggerInterface $logger
    ) {
        $this->productMapperFactory = $productMapper;
        $this->collectionFactory = $collectionFactory;
        $this->messageManager = $messageManager;
        $this->logger = $logger;
    }

    /**
     * Create or update new configbox and Magento Product Mapping
     *
     * @param int $cbProductId      configbox Product Id
     * @param int $magentoProductId Magento Product Id
     *
     * @return boolean
     */
    public function mapCbProductId($cbProductId, $magentoProductId)
    {
        try {
            $previousData = $this->collectionFactory->create()
                ->addFieldToFilter('magento_product_id', $magentoProductId)
                ->getFirstItem();

            if ($previousData->getId()) {
                if ($cbProductId != $previousData->getCbProductId()) {
                    $previousData->setCbProductId($cbProductId);
                    $previousData->save();
                }
            } else {
                $this->productMapperFactory->create()
                    ->setCbProductId($cbProductId)
                    ->setMagentoProductId($magentoProductId)
                    ->save();
            }
        } catch (Exception $e) {
            $this->logger->critical($e);
            $this->messageManager->addErrorMessage(
                __('An error occurred while saving configbox product.')
            );
        }
        return true;
    }

    /**
     * Create or update new configbox and Magento Product Mapping
     *
     * @param int      $magentoProductId Magento Product Id
     * @param int|null $cbProductId      Configbox Product Id
     *
     * @return boolean
     */
    public function deleteCbProductMapping($magentoProductId, $cbProductId = null)
    {
        try {
            $mappedRow = $this->collectionFactory->create()
                ->addFieldToFilter('magento_product_id', $magentoProductId);

            if ($cbProductId) {
                $mappedRow->addFieldToFilter('cb_product_id', $cbProductId);
            }
            $mappedRow = $mappedRow->getFirstItem();

            if ($mappedRow->getId()) {
                $mappedRow->delete();
            }
            return true;
        } catch (Exception $e) {
            $this->logger->critical($e);
            $this->messageManager->addErrorMessage(
                __('An error occurred while deleting configbox product.')
            );
        }
        return true;
    }
}
