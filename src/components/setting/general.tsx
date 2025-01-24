import { useTheme } from "@/hooks/use-theme";
import { deleteChatHistory, deleteAllChatHistory, getChatHistory } from "@/services/dispatch/chat-dispatch";
import { getItem, setItem } from "@/services/session";
import {
  Button,
  Divider,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Select,
  SelectItem,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@nextui-org/react";
import CustomModal from "../customModal";
import { useState } from "react";
import { ArchivedChat } from "../chats/chat-list";
import { RenderArchivedChatsTableCell } from "./renderTableCell";
import { useNavigate } from "react-router-dom";
import { useArchive } from "@/hooks/use-archive";

const GeneralSetting = () => {
  const { theme, setLightTheme, setDarkTheme } = useTheme();

  const [manageModal, setManageModal] = useState(false);
  const [tooltipArchive, setTooltipArchive] = useState(false);
  const [tooltipDelete, setTooltipDelete] = useState(false);
  const [tooltipUnarchive, setTooltipUnarchive] = useState(false);

  const { archivedchats, setArchivedChats } = useArchive();

  const navigate = useNavigate();

  // Archive all chats
  const handleArchieveAll = async () => {
    try {
      const histories = await getChatHistory();
      const archivedData = histories?.conversations.map((v: any) => ({
        id: v.conversation_id,
        name: v.conversation_name,
        created: Date.now(),
      }));
      setItem("archivedChats", archivedData);
      setArchivedChats(archivedData);
    } catch (error) {
      console.error("Error archiving all chats:", error);
    }
  };

  // Unarchive all chats
  const handleUnarchiveAll = () => {
    const chats: ArchivedChat[] = getItem("archivedChats");
    setItem("archivedChats", []);
    setArchivedChats([]);
  };

  // Unarchive specific chat
  const handleUnarchive = (current: string) => {
    const chats: ArchivedChat[] = getItem("archivedChats");
    const updatedChats = chats.filter((chat) => chat.id !== current);
    setItem("archivedChats", updatedChats);
    setArchivedChats(updatedChats);
  };

  // Delete specific chat
  const handleDeleteConversation = async (current: string) => {
    try {
      const chats: ArchivedChat[] = getItem("archivedChats");
      const updatedChats = chats.filter((chat) => chat.id !== current);
      setItem("archivedChats", updatedChats);
      setArchivedChats(updatedChats);
      await deleteChatHistory(current);
    } catch (error) {
      console.error("Error deleting conversation:", error);
    }
  };

  // Delete all chats
  const handleDeleteAll = async () => {
    try {
      setItem("archivedChats", []);
      setArchivedChats([]);
      await deleteAllChatHistory();
    } catch (error) {
      console.error("Error deleting all chats:", error);
    }
  };

  return (
    <>
      {/* Theme Selection */}
      <div className="max-xs:block flex justify-between items-center w-full p-2">
        <div>Theme</div>
        <div>
          <Select
            aria-label="Theme selector"
            selectedKeys={[theme]}
            onSelectionChange={(key) => {
              if ([...key][0] === "light") {
                setLightTheme();
              } else {
                setDarkTheme();
              }
            }}
            items={[
              { key: "light", label: "Light" },
              { key: "dark", label: "Dark" },
            ]}
            size="lg"
            placeholder="Select a theme"
            className="w-40 max-xs:w-full"
          >
            {(opt: { key: string; label: string }) => (
              <SelectItem key={opt.key}>{opt.label}</SelectItem>
            )}
          </Select>
        </div>
      </div>
      <Divider />

      {/* Always show code while using data analytics */}
      <div className="max-xs:block flex justify-between items-center w-full p-2">
        <div>Always show code while using data analytics</div>
        <div>
          <Switch defaultSelected color="default" className="float-end"></Switch>
        </div>
      </div>
      <Divider />

      {/* Language Selection */}
      <div className="max-xs:block flex justify-between items-center w-full p-2">
        <div>Language</div>
        <div>
          <Select
            aria-label="Language selector"
            items={[
              { key: "auto", label: "Auto-detect" },
              { key: "en", label: "English" },
              { key: "hi", label: "Hindi" },
              { key: "bn", label: "Bengali" },
              { key: "gu", label: "Gujarati" },
              { key: "ur", label: "Urdu" },
              { key: "es", label: "Spanish" },
              { key: "fr", label: "French" },
              { key: "zh", label: "Chinese" },
            ]}
            size="lg"
            placeholder="Select a language"
            defaultSelectedKeys={["auto"]}
            className="w-40 max-xs:w-full"
          >
            {(opt: { key: string; label: string }) => (
              <SelectItem key={opt.key}>{opt.label}</SelectItem>
            )}
          </Select>
        </div>
      </div>
      <Divider />

      {/* Archived Chats Section */}
      <div className="max-xs:block flex justify-between items-center w-full p-2">
        <div>Archived Chats</div>
        <div>
          <Button onClick={() => setManageModal(true)} className="w-full">
            Manage
          </Button>
        </div>
      </div>

      {/* Archive All Chats */}
      <div className="max-xs:block flex justify-between items-center w-full p-2">
        <div>Archive All Chats</div>
        <div>
          <Popover
            isOpen={tooltipArchive}
            onBlur={() => setTooltipArchive(false)}
            placement="top-end"
            showArrow
          >
            <PopoverTrigger>
              <Button onClick={() => setTooltipArchive(true)} className="w-full">
                Archive All
              </Button>
            </PopoverTrigger>
            <PopoverContent>
              <div className="px-1 py-2">
                <div className="font-bold">Are you sure?</div>
                <p className="text-small py-2">Archive all chat history.</p>
                <div className="justify-end flex">
                  <Button
                    onClick={() => {
                      handleArchieveAll();
                      setTooltipArchive(false);
                    }}
                    size="sm"
                    color="danger"
                  >
                    Ok
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <Divider />

      {/* Unarchive All Chats */}
      <div className="max-xs:block flex justify-between items-center w-full p-2">
        <div>Unarchive All Chats</div>
        <div>
          <Popover
            isOpen={tooltipUnarchive}
            onBlur={() => setTooltipUnarchive(false)}
            placement="top-end"
            showArrow
          >
            <PopoverTrigger>
              <Button onClick={() => setTooltipUnarchive(true)} className="w-full">
                Unarchive All
              </Button>
            </PopoverTrigger>
            <PopoverContent>
              <div className="px-1 py-2">
                <div className="font-bold">Are you sure?</div>
                <p className="text-small py-2">Unarchive all chat history.</p>
                <div className="justify-end flex">
                  <Button
                    onClick={() => {
                      handleUnarchiveAll();
                      setTooltipUnarchive(false);
                    }}
                    size="sm"
                    color="danger"
                  >
                    Ok
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <Divider />

      {/* Delete All Chats */}
      <div className="max-xs:block flex justify-between items-center w-full p-2">
        <div>Delete All Chats</div>
        <div>
          <Popover
            isOpen={tooltipDelete}
            onBlur={() => setTooltipDelete(false)}
            placement="top-end"
            showArrow
          >
            <PopoverTrigger>
              <Button onClick={() => setTooltipDelete(true)} className="w-full">
                Delete All
              </Button>
            </PopoverTrigger>
            <PopoverContent>
              <div className="px-1 py-2">
                <div className="font-bold">Are you sure?</div>
                <p className="text-small py-2">Delete all chat history.</p>
                <div className="justify-end flex">
                  <Button
                    onClick={() => {
                      handleDeleteAll();
                      setTooltipDelete(false);
                      window.location.href = "/";
                    }}
                    size="sm"
                    color="danger"
                  >
                    Ok
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <Divider />

      {/* Modal to manage archived chats */}
      <CustomModal
        width="w-[90%]"
        height="top-1/4"
        isOpen={manageModal}
        onClose={() => {
          setManageModal(false);
        }}
      >
        <div className="w-full">Archived Chats</div>
        <Divider />
        <Table
          isHeaderSticky
          aria-label="Example table with custom cells"
        >
          <TableHeader
            columns={[
              { uid: "name", name: "Name" },
              { uid: "created", name: "Date Created" },
              { uid: "actions", name: "Actions" },
            ]}
          >
            {(column) => (
              <TableColumn
                key={column?.uid}
                align={column.uid === "name" ? "start" : "center"}
              >
                {column.name}
              </TableColumn>
            )}
          </TableHeader>
          <TableBody items={archivedchats}>
            {(item) => (
              <TableRow key={item.id}>
                {(columnKey) => (
                  <TableCell>
                    {RenderArchivedChatsTableCell(
                      item,
                      columnKey,
                      handleUnarchive,
                      handleDeleteConversation,
                      navigate
                    )}
                  </TableCell>
                )}
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CustomModal>
    </>
  );
};

export default GeneralSetting;
